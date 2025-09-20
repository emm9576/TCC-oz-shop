import express from 'express';
import User from '../../models/user.js';
import Produto from '../../models/produto.js';
import Order from '../../models/order.js';
import { requireLogin } from '../middlewares/auth.js';

const router = express.Router();

// POST - Comprar produto (requer autenticação)
router.post('/:productId', requireLogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body || {};

    // Usar dados do usuário autenticado
    const userId = req.user.id;

    // Verificar se usuário existe (já verificado pelo middleware, mas mantendo para segurança)
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

    // Verificar se há estoque suficiente
    if (produto.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Estoque insuficiente. Disponível: ${produto.stock}` 
      });
    }

    // Calcular preço total (considerando desconto)
    const pricePerUnit = produto.price * (1 - produto.discount / 100);
    const total = pricePerUnit * quantity;

    // Criar o pedido usando o ObjectId do usuário autenticado
    const newOrder = new Order({
      user: req.user._id,
      products: [produto._id],
      date: new Date().toLocaleDateString('pt-BR'),
      total: Number(total.toFixed(2)),
      status: 'pendente',
      items: quantity
    });

    await newOrder.save();

    // Atualizar estoque do produto
    await Produto.findByIdAndUpdate(
      produto._id,
      { $inc: { stock: -quantity } },
      { new: true }
    );

    // Popular os dados para retorno
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('user', '-password')
      .populate({
        path: 'products',
        model: 'Produto'
      });

    res.status(201).json({ 
      success: true, 
      message: 'Compra realizada com sucesso!', 
      data: populatedOrder 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
});

export default router;