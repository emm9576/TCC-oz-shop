import express from 'express';
import Produto from '../../models/produto.js';
import { requireLogin } from '../middlewares/auth.js';

const router = express.Router();

// GET - Buscar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { category, seller, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (category) filter.category = new RegExp(category, 'i');
    if (seller) filter.seller = new RegExp(seller, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const produtos = await Produto.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Produto.countDocuments(filter);

    res.json({ 
      success: true, 
      data: produtos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos', error: error.message });
  }
});

// GET - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.json({ success: true, data: produto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produto', error: error.message });
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

    const userRating = produto.ratings?.find(
      r => r.userId.toString() === userId.toString()
    );

    res.json({ 
      success: true, 
      hasRated: !!userRating,
      rating: userRating ? userRating.rating : null
    });
  } catch (error) {
    console.error('❌ Erro ao verificar avaliação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar avaliação', 
      error: error.message 
    });
  }
});

// POST - Criar novo produto
router.post('/', async (req, res) => {
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

    const newProduto = new Produto({
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
    });

    await newProduto.save();
    res.status(201).json({ success: true, message: 'Produto criado com sucesso!', data: newProduto });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar produto', error: error.message });
  }
});

// PUT - Atualizar produto
router.put('/:id', async (req, res) => {
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
    );

    if (!updatedProduto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    res.json({ success: true, message: 'Produto atualizado com sucesso!', data: updatedProduto });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar produto', error: error.message });
  }
});

// PATCH - Atualizar rating do produto (COM VERIFICAÇÃO DE VOTO ÚNICO)
router.patch('/:id/rating', requireLogin, async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = req.user._id;
    
    console.log('⭐ Tentando avaliar produto:', {
      productId: req.params.id,
      userId: userId.toString(),
      rating
    });
    
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
    const alreadyRated = produto.ratings?.some(
      r => r.userId.toString() === userId.toString()
    );

    console.log('🔍 Já avaliou?', alreadyRated);

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

    console.log('✅ Avaliação salva com sucesso!');

    res.json({ 
      success: true, 
      message: 'Avaliação registrada com sucesso!',
      data: produto 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar rating:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao avaliar produto', 
      error: error.message 
    });
  }
});

// DELETE - Deletar produto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const updates = {
      $set: { deleted: true },
      $unset: {
        category: "",
        description: "",
        discount: "",
        features: "",
        freteGratis: "",
        imageMain: "",
        images: "",
        name: "",
        price: "",
        rating: "",
        reviews: "",
        seller: "",
        stock: ""
      }
    };

    const deletedProduct = await Produto.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    return res.json({ success: true, message: 'Produto soft-deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar produto', error: error.message });
  }
});

// GET - Buscar produtos por vendedor
router.get('/seller/:seller', async (req, res) => {
  try {
    const produtos = await Produto.find({ seller: req.params.seller });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos do vendedor', error: error.message });
  }
});

// GET - Buscar produtos por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const produtos = await Produto.find({ category: new RegExp(req.params.category, 'i') });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos da categoria', error: error.message });
  }
});

// GET - Buscar produtos com frete grátis
router.get('/frete-gratis', async (req, res) => {
  try {
    const produtos = await Produto.find({ freteGratis: true });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos com frete grátis', error: error.message });
  }
});

export default router;