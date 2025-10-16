import Order from '../../models/order.js';
import Produto from '../../models/produto.js';
import User from '../../models/user.js';

// Funcao auxiliar para processar compra - pode ser chamada internamente
export async function processPurchase(userId, productId, quantity = 1, paymentMethod = 'cartao') {
  try {
    // Verificar se usuario existe
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se produto existe
    const produto = await Produto.findOne({ id: productId });
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se ha estoque suficiente
    if (produto.stock < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${produto.stock}`);
    }

    // Calcular preco total (considerando desconto)
    const price = Number(produto.price) || 0;
    const discount = Number(produto.discount) || 0;
    const qty = Number(quantity) || 1;
    
    const pricePerUnit = price * (1 - discount / 100);
    const total = pricePerUnit * qty;

    // Validar se o total foi calculado corretamente
    if (isNaN(total) || total <= 0) {
      throw new Error('Erro ao calcular o total do pedido. Verifique os dados do produto.');
    }

    // Criar o pedido usando o ObjectId do usuario
    const newOrder = new Order({
      user: user._id,
      products: [produto._id],
      date: new Date().toLocaleDateString('pt-BR'),
      total: Number(total.toFixed(2)),
      status: 'pendente',
      items: qty,
      paymentMethod: paymentMethod,
      paymentStatus: 'approved'
    });

    await newOrder.save();

    // Atualizar estoque do produto
    await Produto.findByIdAndUpdate(produto._id, { $inc: { stock: -qty } }, { new: true });

    // Popular os dados para retorno
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('user', 'id name email')
      .populate({
        path: 'products',
        model: 'Produto'
      });

    // Limpar dados sensiveis do usuario manualmente
    const orderResponse = populatedOrder.toObject();
    if (orderResponse.user) {
      orderResponse.user = {
        _id: orderResponse.user._id,
        id: orderResponse.user.id,
        name: orderResponse.user.name,
        email: orderResponse.user.email
      };
    }

    return orderResponse;
  } catch (error) {
    throw error;
  }
}

// Funcoes auxiliares de validacao de cartao
export const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  return /^\d{16}$/.test(cleaned);
};

export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

export const isValidCardName = (name) => {
  return /^[a-zA-ZÀ-ÿ\s]{3,}$/.test(name);
};

export const isValidExpiryDate = (expiryDate) => {
  if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split('/');
  const fullYear = year.length === 2 ? `20${year}` : year;
  const expiryDateObj = new Date(parseInt(fullYear), parseInt(month) - 1);
  const today = new Date();
  
  return expiryDateObj > today;
};