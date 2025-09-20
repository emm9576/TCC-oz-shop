import express from 'express';
import User from '../../models/user.js';
import Order from '../../models/order.js';
import { requireAdmin, requireOwnerOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// GET - Buscar todos os pedidos (apenas admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const orders = await Order.find(filter)
      .populate('user', '-password')
      .populate({
        path: 'products',
        model: 'Produto'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar pedidos', error: error.message });
  }
});

// GET - Buscar pedido por ID (admin ou dono do pedido)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id })
      .populate('user', '-password')
      .populate({
        path: 'products',
        model: 'Produto'
      });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    // Verificar se é admin ou dono do pedido
    if (req.user.role !== 'admin' && order.user.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: você só pode ver seus próprios pedidos' 
      });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar pedido', error: error.message });
  }
});

// GET - Buscar pedidos por usuário (admin ou próprio usuário)
router.get('/user/:userId', requireOwnerOrAdmin('userId'), async (req, res) => {
  try {
    // Primeiro, buscar o usuário pelo ID customizado para obter o ObjectId
    const user = await User.findOne({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Usar o ObjectId do usuário para buscar os pedidos
    const orders = await Order.find({ user: user._id })
      .populate({
        path: 'products',
        model: 'Produto'
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar pedidos do usuário', error: error.message });
  }
});

// PUT - Atualizar pedido (apenas admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, runValidators: true }
    )
    .populate('user', '-password')
    .populate({
      path: 'products',
      model: 'Produto'
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    res.json({ success: true, message: 'Status do pedido atualizado com sucesso!', data: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar pedido', error: error.message });
  }
});

// PATCH - Atualizar apenas status do pedido (apenas admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, runValidators: true }
    )
    .populate('user', '-password')
    .populate({
      path: 'products',
      model: 'Produto'
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    res.json({ success: true, message: 'Status do pedido atualizado com sucesso!', data: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar status do pedido', error: error.message });
  }
});

// DELETE - Soft delete pedido (apenas admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const updates = {
      $set: { deleted: true },
      $unset: {
        user: "",
        products: "",
        date: "",
        total: "",
        status: "",
        items: ""
      }
    };

    const deletedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    res.json({ success: true, data: deletedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar pedido', error: error.message });
  }
});

// GET - Buscar pedidos por status (apenas admin)
router.get('/status/:status', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: req.params.status })
      .populate('user', '-password')
      .populate({
        path: 'products',
        model: 'Produto'
      })
      .sort({ createdAt: -1 });    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar pedidos por status', error: error.message });
  }
});

export default router;