import express from 'express';
import { requireLogin } from '../middlewares/auth.js';
import { processPurchase } from '../utils/checkout.js';

const router = express.Router();

// POST - Comprar produto (requer autenticacao)
router.post('/:productId', requireLogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body || {};

    // Usar dados do usuario autenticado
    const userId = req.user.id;

    const populatedOrder = await processPurchase(userId, productId, quantity, 'cartao');

    res.status(201).json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: populatedOrder
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 
                       error.message.includes('insuficiente') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;