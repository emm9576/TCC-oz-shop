import express from 'express';
import User from '../../models/user.js';
import { loginUser, logoutUser, requireLogin } from '../middlewares/auth.js';

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

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // CORREÇÃO: Verificar se email já existe, excluindo usuários deletados
    const existingUser = await User.findOne({ 
      email: normalizedEmail,
      $or: [
        { deleted: { $exists: false } }, // Campo deleted não existe
        { deleted: false },              // Campo deleted é false
        { deleted: null }                // Campo deleted é null
      ]
    });

    if (existingUser) {
      console.log('❌ Email já cadastrado:', normalizedEmail);
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

    console.log('✅ Criando usuário com email:', normalizedEmail);

    // Criar novo usuário
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      phone: phone.trim(),
      estado: estado ? estado.trim() : undefined,
      cidade: cidade ? cidade.trim() : undefined,
      rua: rua ? rua.trim() : undefined,
      cep: cep ? cep.trim() : undefined,
      deleted: false // Garantir que o campo deleted seja sempre definido
    });

    const savedUser = await newUser.save();
    console.log('✅ Usuário criado com sucesso:', savedUser.email);
    
    // Retornar usuário sem a senha
    const userResponse = { ...savedUser.toObject() };
    delete userResponse.password;
    
    res.status(201).json({ 
      success: true, 
      message: 'Conta criada com sucesso!', 
      data: userResponse 
    });

  } catch (error) {
    console.error('❌ Erro no signup:', error);
    
    // Tratar erros específicos do MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro de validação', 
        errors: validationErrors 
      });
    }
    
    // Erro de duplicação (índice único)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'campo';
      console.log('❌ Erro de duplicação:', error.keyValue);
      
      if (field === 'email') {
        return res.status(400).json({ 
          success: false, 
          message: 'Email já cadastrado' 
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: `${field} já está em uso` 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Normalizar email e buscar usuário (incluindo senha para verificação)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail,
      $or: [
        { deleted: { $exists: false } },
        { deleted: false },
        { deleted: null }
      ]
    }).select('+password');

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
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE - Deletar conta (requer autenticação)
router.delete('/delete-account', requireLogin, async (req, res) => {
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

    // Realizar soft delete com timestamp único para evitar conflitos
    const deletedTimestamp = Date.now();
    const updates = {
      $set: { 
        deleted: true,
        deletedAt: new Date(),
        email: `deleted_${deletedTimestamp}_${user.email}` // Email único para permitir recadastro
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
    console.error('❌ Erro ao deletar conta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST - Logout (revogar refresh token)
router.post('/logout', requireLogin, async (req, res) => {
  try {
    await logoutUser(req.user.id);
    
    res.json({ 
      success: true, 
      message: 'Logout realizado com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota temporária para fazer um admin
router.post('/make-admin', async (req, res) => {
  const { email, secretCode } = req.body;
  
  // Código secreto para segurança
  if (secretCode !== 'adeeme123') {
    return res.status(403).json({ message: 'Código inválido' });
  }
  
  const user = await User.findOneAndUpdate(
    { email: email },
    { role: 'admin' },
    { new: true }
  );
  
  res.json({ message: 'Usuário promovido a admin!', user });
});

// ROTA DE DEBUG - Remova em produção
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTA DE DEBUG - Limpar IDs duplicados - Remova em produção  
router.post('/debug/cleanup', async (req, res) => {
  try {
    // Remover usuários deletados completamente
    const deletedUsers = await User.deleteMany({ deleted: true });
    
    // Encontrar e remover IDs duplicados
    const users = await User.find({}).sort({ createdAt: 1 });
    const seenIds = new Set();
    const duplicatesToRemove = [];
    
    for (const user of users) {
      if (seenIds.has(user.id)) {
        duplicatesToRemove.push(user._id);
      } else {
        seenIds.add(user.id);
      }
    }
    
    const removedDuplicates = await User.deleteMany({ 
      _id: { $in: duplicatesToRemove } 
    });
    
    res.json({ 
      message: 'Cleanup realizado', 
      deletedCount: deletedUsers.deletedCount,
      duplicatesRemoved: removedDuplicates.deletedCount,
      remainingUsers: await User.countDocuments({})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTA DE DEBUG - Resetar IDs sequenciais
router.post('/debug/reset-ids', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: 1 });
    
    for (let i = 0; i < users.length; i++) {
      users[i].id = (i + 1).toString();
      await users[i].save({ validateBeforeSave: false });
    }
    
    res.json({ 
      message: 'IDs resetados com sucesso',
      totalUsers: users.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;