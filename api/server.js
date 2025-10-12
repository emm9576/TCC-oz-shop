import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

// Importar middlewares
import { requireLogin } from './middlewares/auth.js';

// Importar rotas
import accountRoute from './routes/account.js';
import buyRoute from './routes/buy.js';
import ordersRoute from './routes/orders.js';
import produtosRoute from './routes/produtos.js';
import uploadRoute from './routes/upload.js';
import usersRoutes from './routes/users.js';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.URL;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas');
  })
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Usar as rotas
app.use('/api/account', accountRoute);
app.use('/api/buy', buyRoute);
app.use('/api/orders', requireLogin, ordersRoute);
app.use('/api/produtos', produtosRoute);
app.use('/api/upload', uploadRoute); // Nova rota de upload
app.use('/api/users', requireLogin, usersRoutes); // Rotas only admin

// Health Check - Rota para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  // Verificar se há problemas
  const isHealthy = mongoose.connection.readyState === 1;

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: 'running'
    }
  };

  if (isHealthy) {
    healthData.services.database = 'connected';
    res.status(200).json({
      success: true,
      message: 'Servidor funcionando normalmente',
      data: healthData
    });
  } else {
    healthData.services.database = 'disconnected';
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
    message:
      'Bem vindo a API do Oz Shop | Projeto educacional feito para o TCC do curso técnico da FITO | Código fonte disponível no Github: https://github.com/emm9576/TCC-oz-shop',
    endpoints: {
      account: '/api/account',
      buy: '/api/buy',
      orders: '/api/orders',
      produtos: '/api/produtos',
      upload: '/api/upload',
      users: '/api/users'
    }
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em: ${URL}:${PORT}`);
});

export default app;
