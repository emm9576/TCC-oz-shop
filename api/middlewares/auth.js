import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

// Chave secreta para assinar JWT - em produção use variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_forte_aqui';

// Middleware para verificar se usuário está autenticado
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso requerido' 
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda existe e está ativo
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

    // Adicionar dados do usuário à requisição
    req.user = {
      id: user.id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Middleware para verificar se usuário é admin
export const requireAdmin = (req, res, next) => {
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
export const requireOwnerOrAdmin = (userIdParam = 'userId') => {
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

// Função para gerar JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Função para verificar token sem middleware (útil para casos específicos)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};