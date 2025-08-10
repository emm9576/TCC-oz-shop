# TCC E-Shop FITO

Plataforma de e-commerce desenvolvida como Trabalho de Conclusão de Curso (TCC), inspirada em marketplaces como Shopee e Mercado Livre.  
O projeto é dividido em **frontend** (React + Vite + TailwindCSS) e **backend** (Node.js + Express + MongoDB), rodando juntos a partir de um único comando.

---

## 🚀 Tecnologias Utilizadas

### **Frontend**
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (animações)
- [Radix UI](https://www.radix-ui.com/) (componentes acessíveis)
- [React Router DOM](https://reactrouter.com/) (navegação SPA)
- [Lucide React](https://lucide.dev/) (ícones)

### **Backend**
- [Node.js](https://nodejs.org/)
- [Express 5](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/) (ODM para MongoDB)
- [dotenv](https://github.com/motdotla/dotenv) (variáveis de ambiente)
- [cors](https://github.com/expressjs/cors) (configuração de CORS)
- [mongoose-sequence](https://github.com/ramiel/mongoose-sequence) (IDs auto incrementais)

---

## 📦 Pré-requisitos

Antes de iniciar, verifique se possui instalado:
- [Node.js](https://nodejs.org/) (versão 18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) ou servidor MongoDB local

---

## ⚙️ Configuração

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/emm9576/TCC-E-Shop-FITO.git
   cd TCC-E-Shop-FITO
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Criar arquivo `.env` na raiz do projeto**
   ```env
   # Configurações do Banco de Dados
   MONGODB_URI=SUA_CONNECT_STRING_MONGODB

   # Configurações do Servidor
   PORT=3000
   NODE_ENV=development

   # Configurações de Segurança (opcional)
   JWT_SECRET=YOUR_JWT_SECRET

   # Configurações de CORS (opcional)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Adicionar `.env` ao `.gitignore`** (caso não exista)
   ```
   node_modules
   dist
   .env
   ```

---

## ▶️ Como Iniciar o Projeto

O projeto é iniciado pelo arquivo `index.js` que executa **frontend** e **backend** em paralelo.

```bash
node index.js
```

Isso vai:
- Iniciar o **backend** (arquivo `./api/api.js`)
- Iniciar o **frontend** (com `npm run dev` dentro de `./src/`)

A aplicação estará disponível em:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3000`

---

## 📂 Estrutura de Pastas (resumo)

```
TCC-E-Shop-FITO/
│
├── api/               # Backend (API Express)
│   ├── api.js
│   └── ...
│
├── src/               # Frontend (React + Vite)
│   ├── App.jsx
│   └── ...
│
├── index.js           # Script para iniciar backend + frontend
├── package.json
├── .env               # Variáveis de ambiente 
└── README.md
```

---

## 📝 Licença
Projeto acadêmico. Uso livre para fins educacionais.

---