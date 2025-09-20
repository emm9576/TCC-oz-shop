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
    console.log('Conectado ao MongoDB Atlas');
  })
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Usar as rotas
app.use("/api/users", requireLogin, usersRoutes); // Rotas only admin
app.use('/api/produtos', produtosRoutes);
app.use('/api/orders', requireLogin, ordersRoutes);
app.use('/api/buy', buyRoute);
app.use('/api/account', accountRoute);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: '🛒 API do E-commerce funcionando!',
    endpoints: {
      users: '/api/users',
      produtos: '/api/produtos',
      orders: '/api/orders',
      buy: '/api/buy',
      account: '/api/account'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});

export default app;