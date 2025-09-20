import { requireAdmin } from '../middlewares/auth.js';
import express from 'express';
import User from '../../models/user.js';

const router = express.Router();

// GET - Buscar todos os usuários (apenas para admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Não retorna a senha
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar usuários', error: error.message });
  }
});

// GET - Retorna dados do usuário logado
router.get('/me', async (req, res) => {
  try {
    // req.user já contém os dados básicos do middleware
    // Buscar dados completos no banco (sem senha)
    const user = await User.findOne({ 
      id: req.user.id,
      deleted: { $ne: true } 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar dados do usuário', 
      error: error.message 
    });
  }
});

// GET - Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar usuário', error: error.message });
  }
});

// PUT - Atualizar usuário (apenas para admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, estado, cidade, rua, cep } = req.body;
    
    const updatedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      { name, email, phone, estado, cidade, rua, cep },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário atualizado com sucesso!', data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// DELETE - Deletar usuário (soft delete - apenas para admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const updates = {
      $set: { deleted: true },
      $unset: {
        name: "",
        password: "",
        email: "",
        phone: "",
        estado: "",
        cidade: "",
        rua: "",
        cep: ""
      }
    };

    const deletedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.json({ success: true, message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário', error: error.message });
  }
});

export default router;