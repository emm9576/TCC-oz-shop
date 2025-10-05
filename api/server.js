import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar middlewares
import { requireLogin } from './middlewares/auth.js';

// Importar rotas
import usersRoutes from './routes/users.js';
import produtosRoutes from './routes/produtos.js';
import ordersRoutes from './routes/orders.js';
import buyRoute from './routes/buy.js'
import accountRoute from './routes/account.js'
import uploadRoute from './routes/upload.js'

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.URL

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas');
  })
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Usar as rotas
app.use("/api/users", requireLogin, usersRoutes); // Rotas only admin
app.use('/api/produtos', produtosRoutes);
app.use('/api/orders', requireLogin, ordersRoutes);
app.use('/api/buy', buyRoute);
app.use('/api/account', accountRoute);
app.use('/api/upload', uploadRoute); // Nova rota de upload

// Health Check - Rota para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  };

  // Verificar se há problemas
  const isHealthy = mongoose.connection.readyState === 1;

  if (isHealthy) {
    res.status(200).json({
      success: true,
      message: 'Servidor funcionando normalmente',
      data: healthData
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Servidor com problemas',
      data: healthData
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bem vindo a API do Oz Shop | Projeto educacional feito para o TCC do curso técnico da FITO | Código fonte disponível no Github: https://github.com/emm9576/TCC-oz-shop',
    endpoints: {
      users: '/api/users',
      produtos: '/api/produtos',
      orders: '/api/orders',
      buy: '/api/buy',
      account: '/api/account',
      upload: '/api/upload'
    }
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em: ${URL}:${PORT}`);
});

export default app;