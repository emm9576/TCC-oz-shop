import express from 'express';
import User from '../../models/user.js';
import { loginUser, logoutUser, authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// POST - Signup (Criar conta)
router.post('/signup', async (req, res) => {
  try {
    // Verificar se o body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados de cadastro são obrigatórios' 
      });
    }

    const { name, email, password, phone, estado, cidade, rua, cep } = req.body;
    
    // Validar campos obrigatórios (baseado no schema)
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!password || password.trim() === '') missingFields.push('password');
    if (!phone || phone.trim() === '') missingFields.push('phone');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Campos obrigatórios faltando: ${missingFields.join(', ')}` 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de email inválido' 
      });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }

    // Validar CEP se fornecido (formato brasileiro: 12345-678 ou 12345678)
    if (cep && cep.trim() !== '') {
      const cepRegex = /^\d{5}-?\d{3}$/;
      if (!cepRegex.test(cep)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Formato de CEP inválido. Use: 12345-678 ou 12345678' 
        });
      }
    }

    // Validar telefone brasileiro básico (formato: 11999999999 ou (11)99999-9999)
    const phoneClean = phone.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de telefone inválido. Use 10 ou 11 dígitos' 
      });
    }

    // Criar novo usuário
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      phone: phone.trim(),
      estado: estado ? estado.trim() : undefined,
      cidade: cidade ? cidade.trim() : undefined,
      rua: rua ? rua.trim() : undefined,
      cep: cep ? cep.trim() : undefined
    });

    await newUser.save();
    
    // Retornar usuário sem a senha
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;
    
    res.status(201).json({ 
      success: true, 
      message: 'Conta criada com sucesso!', 
      data: userResponse 
    });

  } catch (error) {
    // Tratar erros específicos do MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro de validação', 
        errors: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
});

// POST - Login
router.post('/login', async (req, res) => {
  try {
    // Verificar se o body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    const { email, password } = req.body;
    
    // Validar campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário por email (incluindo senha para verificação)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha (comparação simples - em produção use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Login bem-sucedido - usar sistema completo de login
    const loginResult = await loginUser(user);
    
    res.json({ 
      success: true, 
      message: 'Login realizado com sucesso!', 
      data: loginResult.user,
      token: loginResult.accessToken
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
});

// DELETE - Deletar conta (requer autenticação)
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validar senha obrigatória
    if (!password || password.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha é obrigatória para confirmar exclusão' 
      });
    }

    // Buscar usuário atual com senha para verificação
    const user = await User.findOne({ 
      id: req.user.id 
    }).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Verificar senha
    if (user.password !== password.trim()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }

    // Realizar soft delete
    const updates = {
      $set: { 
        deleted: true,
        email: `deleted_${Date.now()}_${user.email}` // Evitar conflito de email único
      },
      $unset: {
        name: "",
        password: "",
        phone: "",
        estado: "",
        cidade: "",
        rua: "",
        cep: ""
      }
    };

    await User.findByIdAndUpdate(user._id, updates, { new: true });

    res.json({ 
      success: true, 
      message: 'Conta deletada com sucesso!' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
});

// POST - Logout (revogar refresh token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await logoutUser(req.user.id);
    
    res.json({ 
      success: true, 
      message: 'Logout realizado com sucesso!' 
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