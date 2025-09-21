import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../../models/user.js';

import dotenv from 'dotenv';
dotenv.config();

// Chave secreta para assinar JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar se usuário está logado
const requireLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso requerido' 
      });
    }

    // Verificar o token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário no banco
      const user = await User.findOne({ 
        id: decoded.userId, 
        deleted: { $ne: true } 
      }).select('-password');

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não encontrado ou desativado' 
        });
      }

      // Token válido - adicionar dados do usuário à requisição
      req.user = {
        id: user.id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return next();

    } catch (tokenError) {
      // Token expirado ou inválido
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado. Faça login novamente.' 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido. Faça login novamente.' 
        });
      } else {
        throw tokenError; // Re-throw se for outro tipo de erro
      }
    }

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Middleware para verificar se usuário é admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado: privilégios de administrador requeridos' 
    });
  }
};

// Middleware para verificar se usuário é dono do recurso OU admin
const requireOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdParam];
    
    if (req.user && (req.user.role === 'admin' || req.user.id === resourceUserId)) {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: você só pode acessar seus próprios recursos' 
      });
    }
  };
};

// Função para gerar access token (1 dia)
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Função para gerar refresh token permanente (UUID)
const generateRefreshToken = () => {
  return uuidv4();
};

// Função para fazer login completo
const loginUser = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Salvar refresh token no banco
  await User.findByIdAndUpdate(user._id, { 
    refreshToken: refreshToken 
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

// Função para logout (revogar refresh token)
const logoutUser = async (userId) => {
  await User.findOneAndUpdate(
    { id: userId }, 
    { refreshToken: null }
  );
};

// Função para verificar token sem middleware (útil para casos específicos)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export { requireLogin, requireAdmin, requireOwnerOrAdmin, generateAccessToken, generateRefreshToken, loginUser, logoutUser, verifyToken };