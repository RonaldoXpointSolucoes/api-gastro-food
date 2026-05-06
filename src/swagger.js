const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gastro Food',
      version: '1.0.0',
      description: 'API REST para Integração de Pedidos Multiempresa',
    },
    servers: [
      {
        url: 'https://apigastro.xpointsolucoes.com.br',
        description: 'Produção (HTTPS)',
      },
      {
        url: 'http://l0kkccs0cwwsgwkc088cw4wg.69.62.92.212.sslip.io',
        description: 'Produção (Coolify Direto)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Token',
          description: 'Insira o Token da empresa fornecido no painel.'
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
