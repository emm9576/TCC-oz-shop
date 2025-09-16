import express from 'express';
import User from '../../../models/user.js';
import Produto from '../../../models/produto.js';
import Order from '../../../models/order.js';

const router = express.Router();

// GET - Buscar todos os pedidos
router.get('/', async (req, res) => {
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

// GET - Buscar pedido por ID
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
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar pedido', error: error.message });
  }
});

// GET - Buscar pedidos por usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
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

// PUT - Atualizar pedido (apenas para admin - não permite modificar user/products/total)
router.put('/:id', async (req, res) => {
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

// PATCH - Atualizar apenas status do pedido
router.patch('/:id/status', async (req, res) => {
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

// DELETE - Soft delete pedido
router.delete('/:id', async (req, res) => {
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

// GET - Buscar pedidos por status
router.get('/status/:status', async (req, res) => {
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