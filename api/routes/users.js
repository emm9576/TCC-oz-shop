import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';
import { requireAdmin, requireLogin } from '../middlewares/auth.js';

const router = express.Router();

// Lista de campos atualizáveis do usuário
const updatableFields = [
  'name',
  'email',
  'phone',
  'estado',
  'cidade',
  'rua',
  'cep',
  'bio',
  'shareInfo',
  'profilePicture'
];

// Função para formatar os dados do usuário
function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    estado: user.estado,
    cidade: user.cidade,
    rua: user.rua,
    cep: user.cep,
    bio: user.bio,
    shareInfo: user.shareInfo,
    profilePicture: user.profilePicture,
    role: user.role,
    createdAt: user.createdAt
  };
}

// GET - Buscar todos os usuários (apenas para admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Não retorna a senha
    res.json({ success: true, data: users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao buscar usuários', error: error.message });
  }
});

// GET - Retorna dados completos do usuário logado
router.get('/me', requireLogin, async (req, res) => {
  try {
    // req.user já contém os dados básicos do middleware
    // Buscar dados completos no banco (sem senha)
    const user = await User.findOne({
      id: req.user.id,
      deleted: { $ne: true }
    }).select('-password -deleted -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Retornar todos os campos do usuário (exceto senha)
    res.json({
      success: true,
      data: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
      error: error.message
    });
  }
});

// PUT - Atualizar dados do próprio usuário logado
router.put('/me', requireLogin, async (req, res) => {
  try {
    // Extrair campos atualizáveis do req.body
    const updateData = {};
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    const { email } = updateData;

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        email: email,
        id: { $ne: req.user.id },
        deleted: { $ne: true }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso por outro usuário.'
        });
      }
    }

    const updatedUser = await User.findOneAndUpdate({ id: req.user.id }, updateData, {
      new: true,
      runValidators: true
    }).select('-password -deleted -__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      data: formatUser(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
});

// GET - Buscar usuário por ID
// ALTERAÇÃO: Verifica se é admin OU respeita as configurações de shareInfo
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      id: req.params.id,
      deleted: { $ne: true }
    }).select('-password -deleted -__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Verificar se há token e se é admin
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuário que fez a requisição para verificar role
        const requestUser = await User.findOne({
          id: decoded.userId,
          deleted: { $ne: true }
        });

        if (requestUser && requestUser.role === 'admin') {
          isAdmin = true;
        }
      } catch {
        // Token inválido ou expirado - continua como não-admin
        console.log('Token inválido ou expirado na requisição de perfil');
      }
    }

    // Se for admin, retorna todos os dados (exceto senha e refreshToken)
    if (isAdmin) {
      return res.json({
        success: true,
        data: formatUser(user)
      });
    }

    // Se não for admin, respeita as configurações de shareInfo
    // Garantir que shareInfo existe e tem a estrutura correta
    const shareInfo =
      user.shareInfo && typeof user.shareInfo === 'object'
        ? user.shareInfo
        : {
            email: false,
            phone: false,
            estado: false,
            cidade: false,
            cep: false
          };

    // Campos públicos padrão
    const publicFields = ['id', 'name', 'bio', 'profilePicture', 'role', 'createdAt'];

    // Adicionar campos opcionais baseado em shareInfo
    const shareableFields = ['email', 'phone', 'estado', 'cidade', 'cep'];
    shareableFields.forEach((field) => {
      if (shareInfo[field] === true && user[field]) {
        publicFields.push(field);
      }
    });

    // Criar objeto com apenas os campos permitidos
    const publicData = {};
    publicFields.forEach((field) => {
      if (user[field] !== undefined) {
        publicData[field] = user[field];
      }
    });

    return res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao buscar usuário', error: error.message });
  }
});

// PUT - Atualizar usuário (apenas para admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Extrair campos atualizáveis do req.body
    const updateData = {};
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const updatedUser = await User.findOneAndUpdate({ id: req.params.id }, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário atualizado com sucesso!', data: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// DELETE - Deletar usuário (soft delete - apenas para admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const updates = {
      $set: { deleted: true },
      $unset: {
        name: '',
        password: '',
        email: '',
        phone: '',
        estado: '',
        cidade: '',
        rua: '',
        cep: '',
        bio: '',
        shareInfo: '',
        profilePicture: ''
      }
    };

    const deletedUser = await User.findOneAndUpdate({ id: req.params.id }, updates, { new: true });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.json({ success: true, message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao deletar usuário', error: error.message });
  }
});

export default router;
