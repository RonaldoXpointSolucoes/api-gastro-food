const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const authenticateToken = require('./middleware/auth');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de documentação (Swagger)
// Configurando um CSS customizado para aparência mais limpa
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerUiOptions));

// Rotas protegidas da API
app.use('/api/orders', authenticateToken, ordersRouter);

// Rotas do Admin de Tokens (neste momento localmente liberado)
app.use('/api/admin', adminRouter);

// Interface Administrativa (Painel Premium Frontend)
app.use('/admin', express.static(path.join(__dirname, '../public')));

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📚 Documentação Swagger em: http://localhost:${port}/api-docs`);
});
