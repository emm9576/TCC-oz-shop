import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from '../models/user.js';
import Produto from '../models/produto.js';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas!');
    console.log('🚀 Banco de dados iniciado com sucesso!');
  })
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// ==================== ROTAS DE USUÁRIOS ====================

// GET - Buscar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Não retorna a senha
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar usuários', error: error.message });
  }
});

// GET - Buscar usuário por ID
app.get('/api/users/:id', async (req, res) => {
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

// POST - Criar novo usuário
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, phone, estado, cidade, rua, cep } = req.body;
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    // Gerar próximo ID sequencial
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? (parseInt(lastUser.id) + 1).toString() : "1";

    const newUser = new User({
      id: nextId,
      name,
      email,
      password,
      phone,
      estado,
      cidade,
      rua,
      cep
    });

    await newUser.save();
    
    // Retornar usuário sem a senha
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;
    
    res.status(201).json({ success: true, message: 'Usuário criado com sucesso!', data: userResponse });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar usuário', error: error.message });
  }
});

// PUT - Atualizar usuário
app.put('/api/users/:id', async (req, res) => {
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

// DELETE - Deletar usuário
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ id: req.params.id });
    
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário', error: error.message });
  }
});

// ==================== ROTAS DE PRODUTOS ====================

// GET - Buscar todos os produtos
app.get('/api/produtos', async (req, res) => {
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
app.get('/api/produtos/:id', async (req, res) => {
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

// POST - Criar novo produto
app.post('/api/produtos', async (req, res) => {
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

    // Gerar próximo ID sequencial
    const lastProduto = await Produto.findOne().sort({ id: -1 });
    const nextId = lastProduto ? (parseInt(lastProduto.id) + 1).toString() : "1";

    const newProduto = new Produto({
      id: nextId,
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
app.put('/api/produtos/:id', async (req, res) => {
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

// PATCH - Atualizar rating do produto
app.patch('/api/produtos/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating deve estar entre 1 e 5' });
    }

    const produto = await Produto.findOne({ id: req.params.id });
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    // Calcular novo rating médio
    const totalRatings = produto.reviews;
    const currentTotal = produto.rating * totalRatings;
    const newTotal = currentTotal + rating;
    const newReviews = totalRatings + 1;
    const newRating = newTotal / newReviews;

    const updatedProduto = await Produto.findOneAndUpdate(
      { id: req.params.id },
      { 
        rating: Math.round(newRating * 10) / 10, // Arredondar para 1 casa decimal
        reviews: newReviews 
      },
      { new: true }
    );

    res.json({ success: true, message: 'Rating atualizado com sucesso!', data: updatedProduto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar rating', error: error.message });
  }
});

// DELETE - Deletar produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const deletedProduto = await Produto.findOneAndDelete({ id: req.params.id });
    
    if (!deletedProduto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    res.json({ success: true, message: 'Produto deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar produto', error: error.message });
  }
});

// ==================== ROTAS ESPECIAIS ====================

// GET - Buscar produtos por vendedor
app.get('/api/produtos/seller/:seller', async (req, res) => {
  try {
    const produtos = await Produto.find({ seller: req.params.seller });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos do vendedor', error: error.message });
  }
});

// GET - Buscar produtos por categoria
app.get('/api/produtos/category/:category', async (req, res) => {
  try {
    const produtos = await Produto.find({ category: new RegExp(req.params.category, 'i') });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos da categoria', error: error.message });
  }
});

// GET - Buscar produtos com frete grátis
app.get('/api/produtos/frete-gratis', async (req, res) => {
  try {
    const produtos = await Produto.find({ freteGratis: true });
    res.json({ success: true, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos com frete grátis', error: error.message });
  }
});

// ==================== ROTA RAIZ ====================

app.get('/', (req, res) => {
  res.json({ 
    message: '🛒 API do E-commerce funcionando!',
    endpoints: {
      users: '/api/users',
      produtos: '/api/produtos'
    }
  });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log('🚀 API iniciada com sucesso!');
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

export default app;