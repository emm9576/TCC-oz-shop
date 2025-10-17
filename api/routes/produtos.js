import express from 'express';
import Produto from '../../models/produto.js';
import User from '../../models/user.js';
import { requireLogin } from '../middlewares/auth.js';

const router = express.Router();

// GET - Buscar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { category, seller, userId, minPrice, maxPrice, search } = req.query;

    const filter = {};
    filter.deleted = { $ne: true };
    if (category) filter.category = new RegExp(category, 'i');
    if (seller) filter.seller = new RegExp(seller, 'i');
    if (search) filter.name = new RegExp(search, 'i');
    if (userId) {
      const user = await User.findOne({ id: userId });
      if (user) {
        filter.userId = user._id;
      }
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const produtos = await Produto.find(filter)
      .populate('userId', 'id name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao buscar produtos', error: error.message });
  }
});

// GET - Buscar produtos do usuário logado
router.get('/my-products', requireLogin, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar produtos onde o sellerId é o ID do usuário logado
    const produtos = await Produto.find({ sellerId: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Produtos do usuário recuperados com sucesso',
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos do usuário',
      error: error.message
    });
  }
});

// GET - Obter quantidade total de produtos (excluindo deletados)
router.get('/count', async (req, res) => {
  try {
    const count = await Produto.countDocuments({ deleted: { $ne: true } });
    res.json({
      success: true,
      data: {
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao contar produtos',
      error: error.message
    });
  }
});


// GET - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const produto = await Produto.findOne({ id: req.params.id }).populate(
      'userId',
      'id name email phone estado cidade'
    );
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.json({ success: true, data: produto });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao buscar produto', error: error.message });
  }
});

// POST - Criar novo produto
router.post('/', requireLogin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      stock,
      freteGratis,
      seller,
      imageMain,
      images,
      features
    } = req.body;

    // Buscar usuário logado para obter o ObjectId
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const newProduto = new Produto({
      name,
      description,
      category,
      price,
      discount,
      stock,
      freteGratis,
      seller,
      userId: user._id,
      imageMain,
      images,
      features
    });

    await newProduto.save();

    // Popular o userId antes de retornar
    const populatedProduto = await Produto.findById(newProduto._id).populate(
      'userId',
      'id name email'
    );

    res
      .status(201)
      .json({ success: true, message: 'Produto criado com sucesso!', data: populatedProduto });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Erro ao criar produto', error: error.message });
  }
});

// PUT - Atualizar produto
router.put('/:id', requireLogin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      stock,
      freteGratis,
      imageMain,
      images,
      features
    } = req.body;

    // Buscar o produto para verificar permissões
    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    // Verificar se o usuário é dono do produto ou admin
    if (req.user.role !== 'admin' && produto.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este produto'
      });
    }

    const updatedProduto = await Produto.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        description,
        category,
        price,
        discount,
        stock,
        freteGratis,
        imageMain,
        images,
        features
      },
      { new: true, runValidators: true }
    ).populate('userId', 'id name email');

    res.json({ success: true, message: 'Produto atualizado com sucesso!', data: updatedProduto });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Erro ao atualizar produto', error: error.message });
  }
});

// PATCH - Atualizar rating do produto (COM VERIFICAÇÃO DE VOTO ÚNICO)
router.patch('/:id/rating', requireLogin, async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = req.user._id;

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating deve estar entre 1 e 5'
      });
    }

    // Buscar o produto
    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Verificar se o usuário já avaliou este produto
    const alreadyRated = produto.ratings?.some((r) => r.userId.toString() === userId.toString());

    if (alreadyRated) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este produto',
        alreadyRated: true
      });
    }

    // Inicializar array de ratings se não existir
    if (!produto.ratings) {
      produto.ratings = [];
    }

    // Adicionar novo rating ao array
    produto.ratings.push({
      userId,
      rating: Number(rating),
      createdAt: new Date()
    });

    // Recalcular a média de rating
    const totalRatings = produto.ratings.length;
    const sumRatings = produto.ratings.reduce((acc, r) => acc + r.rating, 0);
    const newRating = sumRatings / totalRatings;

    // Atualizar campos rating e reviews
    produto.rating = Math.round(newRating * 10) / 10; // Arredondar para 1 casa decimal
    produto.reviews = totalRatings;

    // Salvar as alterações
    await produto.save();

    res.json({
      success: true,
      message: 'Avaliação registrada com sucesso!',
      data: produto
    });
  } catch (error) {
    console.error('Erro ao atualizar rating:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao avaliar produto',
      error: error.message
    });
  }
});

// GET - Verificar se usuário já avaliou o produto
router.get('/:id/rating/check', requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;

    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const userRating = produto.ratings?.find((r) => r.userId.toString() === userId.toString());

    res.json({
      success: true,
      hasRated: !!userRating,
      rating: userRating ? userRating.rating : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar avaliação',
      error: error.message
    });
  }
});

// DELETE - Deletar produto (soft delete)
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    // Buscar o produto para verificar permissões
    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    // Verificar se o usuário é dono do produto ou admin
    if (req.user.role !== 'admin' && produto.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este produto'
      });
    }

    const updates = {
      $set: { deleted: true },
      $unset: {
        category: '',
        description: '',
        discount: '',
        features: '',
        freteGratis: '',
        imageMain: '',
        images: '',
        name: '',
        price: '',
        rating: '',
        reviews: '',
        seller: '',
        stock: '',
        userId: ''
      }
    };

    await Produto.findOneAndUpdate({ id: req.params.id }, updates, {
      new: true
    });

    return res.json({ success: true, message: 'Produto soft-deletado com sucesso!' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao deletar produto', error: error.message });
  }
});

// GET - Buscar produtos por vendedor (usando campo seller)
router.get('/seller/:seller', async (req, res) => {
  try {
    const produtos = await Produto.find({ seller: req.params.seller }).populate(
      'userId',
      'id name email'
    );
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos do vendedor',
      error: error.message
    });
  }
});

// GET - Buscar produtos por userId
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const produtos = await Produto.find({ userId: user._id }).populate(
      'userId',
      'id name email phone estado cidade'
    );
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos do usuário',
      error: error.message
    });
  }
});

// GET - Buscar produtos por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const produtos = await Produto.find({
      category: new RegExp(req.params.category, 'i')
    }).populate('userId', 'id name email');
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos da categoria',
      error: error.message
    });
  }
});

// GET - Buscar produtos com frete grátis
router.get('/frete-gratis', async (req, res) => {
  try {
    const produtos = await Produto.find({ freteGratis: true }).populate('userId', 'id name email');
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos com frete grátis',
      error: error.message
    });
  }
});

export default router;