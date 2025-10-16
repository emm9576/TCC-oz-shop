import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../../models/order.js';
import Produto from '../../models/produto.js';
import User from '../../models/user.js';
import { requireLogin } from '../middlewares/auth.js';
import { processPurchase, isValidCardName, isValidCVV, isValidCardNumber, isValidExpiryDate } from '../utils/checkout.js';

const router = express.Router();

// POST - Checkout com PIX
router.post('/pix/:productId', requireLogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body || {};
    const userId = req.user.id;

    // Verificar se usuario existe
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se produto existe
    const produto = await Produto.findOne({ id: productId });
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Verificar se ha estoque suficiente
    if (produto.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Estoque insuficiente. Disponível: ${produto.stock}`
      });
    }

    // Calcular preco total
    const pricePerUnit = produto.price * (1 - produto.discount / 100);
    const total = pricePerUnit * quantity;

    // Gerar codigo PIX unico e data de expiracao (5 minutos)
    const pixCode = uuidv4();
    const pixExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Criar ordem pendente (NAO deduz estoque ainda)
    const newOrder = new Order({
      user: user._id,
      products: [produto._id],
      date: new Date().toLocaleDateString('pt-BR'),
      total: Number(total.toFixed(2)),
      status: 'pendente',
      items: quantity,
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      paymentDetails: {
        pixCode: pixCode,
        pixExpiresAt: pixExpiresAt
      }
    });

    await newOrder.save();

    // Retornar informacoes do PIX
    res.status(201).json({
      success: true,
      message: 'Código PIX gerado com sucesso. Pagamento expira em 5 minutos.',
      paymentMethod: 'pix',
      orderId: newOrder.id,
      pixCode: pixCode,
      pixLink: `${req.protocol}://${req.get('host')}/api/checkout/pix/confirm/${pixCode}`,
      expiresAt: pixExpiresAt.toISOString(),
      total: total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar código PIX',
      error: error.message
    });
  }
});

// POST - Confirmar pagamento PIX (PUBLICO - sem autenticacao)
router.post('/pix/confirm/:pixCode', async (req, res) => {
  try {
    const { pixCode } = req.params;

    // Buscar ordem pelo codigo PIX
    const order = await Order.findOne({ 'paymentDetails.pixCode': pixCode })
      .populate('user', 'id name email')
      .populate({
        path: 'products',
        model: 'Produto'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Código PIX não encontrado'
      });
    }

    // Verificar se ja foi pago
    if (order.paymentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Este pagamento já foi confirmado anteriormente'
      });
    }

    // Verificar se expirou
    if (new Date() > order.paymentDetails.pixExpiresAt) {
      // Marcar como expirado
      order.paymentStatus = 'expired';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Código PIX expirado. Por favor, gere um novo código.'
      });
    }

    // Obter dados do produto para deduzir estoque
    const produto = await Produto.findById(order.products[0]);
    
    // Verificar estoque novamente
    if (produto.stock < order.items) {
      order.paymentStatus = 'failed';
      await order.save();
      
      return res.status(400).json({
        success: false,
        message: `Estoque insuficiente no momento da confirmação. Disponível: ${produto.stock}`
      });
    }

    // Deduzir estoque
    await Produto.findByIdAndUpdate(produto._id, { $inc: { stock: -order.items } }, { new: true });

    // Atualizar status do pagamento
    order.paymentStatus = 'approved';
    order.status = 'aprovado';
    await order.save();

    // Limpar dados sensiveis do usuario antes de retornar
    const orderResponse = order.toObject();
    if (orderResponse.user) {
      orderResponse.user = {
        _id: orderResponse.user._id,
        id: orderResponse.user.id,
        name: orderResponse.user.name,
        email: orderResponse.user.email
      };
    }

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: 'Pagamento confirmado com sucesso!',
      data: orderResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar pagamento PIX',
      error: error.message
    });
  }
});

// GET - Verificar status do pagamento PIX (PUBLICO)
router.get('/pix/status/:pixCode', async (req, res) => {
  try {
    const { pixCode } = req.params;

    const order = await Order.findOne({ 'paymentDetails.pixCode': pixCode })
      .select('paymentStatus paymentDetails.pixExpiresAt id total');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Código PIX não encontrado'
      });
    }

    // Verificar se expirou mas ainda nao foi marcado
    if (order.paymentStatus === 'pending' && new Date() > order.paymentDetails.pixExpiresAt) {
      order.paymentStatus = 'expired';
      await order.save();
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      expiresAt: order.paymentDetails.pixExpiresAt,
      total: order.total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento',
      error: error.message
    });
  }
});

// POST - Checkout com Cartao
router.post('/cartao/:productId', requireLogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1, cardNumber, cardName, cvv, expiryDate } = req.body || {};
    const userId = req.user.id;

    // Validar dados do cartao
    if (!cardNumber || !cardName || !cvv || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Dados do cartão incompletos'
      });
    }

    if (!isValidCardNumber(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Número do cartão inválido'
      });
    }

    if (!isValidCardName(cardName)) {
      return res.status(400).json({
        success: false,
        message: 'Nome do titular inválido'
      });
    }

    if (!isValidCVV(cvv)) {
      return res.status(400).json({
        success: false,
        message: 'CVV inválido'
      });
    }

    if (!isValidExpiryDate(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de validade inválida ou cartão expirado'
      });
    }

    // Processar compra (deduz estoque e cria ordem aprovada)
    const order = await processPurchase(userId, productId, quantity, 'cartao');

    res.status(201).json({
      success: true,
      message: 'Compra realizada com sucesso!',
      paymentMethod: 'cartao',
      data: order
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 
                       error.message.includes('insuficiente') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erro ao processar pagamento',
      error: error.message
    });
  }
});

// POST - Checkout com Boleto
router.post('/boleto/:productId', requireLogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.id;

    // Processar compra (deduz estoque e cria ordem aprovada)
    const order = await processPurchase(userId, productId, quantity, 'boleto');

    res.status(201).json({
      success: true,
      message: 'Boleto gerado com sucesso! Compra realizada.',
      paymentMethod: 'boleto',
      data: order
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 
                       error.message.includes('insuficiente') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erro ao processar pagamento',
      error: error.message
    });
  }
});

export default router;