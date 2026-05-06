const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gastro Food',
      version: '2.0.6',
      description: `## Bem-vindo à Documentação Oficial da Gastro Food API
Esta API permite a integração transparente entre plataformas externas (ERPs, PDVs, Sistemas de Gestão) e a base de dados da Gastro Food.

---

### 📖 Regras de Negócio
Para garantir que as transações ocorram de forma correta e sem a necessidade de intervenção do suporte, siga estritamente as regras abaixo:

1. **Autenticação:** Toda requisição deve conter o cabeçalho \`Authorization: Bearer <SEU_TOKEN>\`. O token é gerado no Painel Administrativo.
2. **Store ID (fkStore):** Os pedidos são filtrados e isolados por loja. O UUID da loja deve ser fornecido via Query Params (GET) ou no corpo da requisição (POST).
3. **Status do Pedido (integrated):** 
   - Ao puxar novos pedidos (\`/api/orders\`), você receberá os que estão com status pendente (\`integrated: false\`).
   - Após importar o pedido com sucesso para o seu ERP, **você deve obrigatoriamente** chamar a rota \`PUT /api/orders/{id}/integrated\` para marcar como \`integrated: true\`.
   - Se isso não for feito, o pedido continuará caindo nas próximas buscas e será duplicado no seu software.
4. **Campos Obrigatórios:** Nome do cliente (\`accessName\`), Subtotal, Pagamento (\`pagto\`) e Lista de Itens são cruciais para o faturamento.

---

### 💻 Exemplos Práticos de Implementação

Aqui estão exemplos prontos de como consumir esta API em diversas linguagens. 
> **Nota:** Substitua \`SEU_TOKEN_AQUI\` pelo seu Bearer Token e \`URL_DA_API\` pela URL de produção selecionada acima.

<details>
  <summary><b>🟣 Exemplo em Node.js (Axios)</b></summary>

\`\`\`javascript
const axios = require('axios');

async function buscarPedidosPendentes() {
  try {
    const response = await axios.get('https://api-gastro-food.vercel.app/api/orders', {
      headers: {
        'Authorization': 'Bearer SEU_TOKEN_AQUI'
      },
      params: {
        fkStore: 'UUID_DA_LOJA'
      }
    });
    console.log('Pedidos:', response.data);
  } catch (error) {
    console.error('Erro na integração:', error.response.data);
  }
}
\`\`\`
</details>

<details>
  <summary><b>🔵 Exemplo em Delphi (TRESTClient)</b></summary>

\`\`\`pascal
procedure BuscarPedidosGastroFood;
var
  RESTClient: TRESTClient;
  RESTRequest: TRESTRequest;
  RESTResponse: TRESTResponse;
begin
  RESTClient := TRESTClient.Create('https://api-gastro-food.vercel.app/api/orders?fkStore=UUID_DA_LOJA');
  RESTRequest := TRESTRequest.Create(nil);
  RESTResponse := TRESTResponse.Create(nil);
  try
    RESTRequest.Client := RESTClient;
    RESTRequest.Response := RESTResponse;
    RESTRequest.Method := rmGET;
    
    // Adicionando Token
    RESTRequest.Params.AddHeader('Authorization', 'Bearer SEU_TOKEN_AQUI');
    
    RESTRequest.Execute;
    
    if RESTResponse.StatusCode = 200 then
      ShowMessage('Sucesso: ' + RESTResponse.Content)
    else
      ShowMessage('Erro: ' + RESTResponse.Content);
  finally
    RESTClient.Free;
    RESTRequest.Free;
    RESTResponse.Free;
  end;
end;
\`\`\`
</details>

<details>
  <summary><b>🐘 Exemplo em PHP (cURL)</b></summary>

\`\`\`php
<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api-gastro-food.vercel.app/api/orders?fkStore=UUID_DA_LOJA",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer SEU_TOKEN_AQUI"
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
?>
\`\`\`
</details>

<details>
  <summary><b>☕ Exemplo em Java (OkHttp)</b></summary>

\`\`\`java
OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
  .url("https://api-gastro-food.vercel.app/api/orders?fkStore=UUID_DA_LOJA")
  .get()
  .addHeader("Authorization", "Bearer SEU_TOKEN_AQUI")
  .build();

try (Response response = client.newCall(request).execute()) {
  System.out.println(response.body().string());
}
\`\`\`
</details>
`,
    },
    servers: [
      {
        url: 'https://api-gastro-food.vercel.app',
        description: 'Produção Oficial (HTTPS)',
      },
      {
        url: 'https://apigastro.xpointsolucoes.com.br',
        description: 'Produção Domínio Próprio (HTTPS)',
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
