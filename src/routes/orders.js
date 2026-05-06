const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestão de pedidos Gastro Food
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *         codePdv:
 *           type: string
 *         name:
 *           type: string
 *           description: "Nome do produto"
 *         amount:
 *           type: integer
 *           description: "Quantidade solicitada"
 *         unitary:
 *           type: string
 *           description: "Valor unitário em string"
 *         price:
 *           type: number
 *           description: "Valor total do item (quantidade * unitário)"
 *         priceFormatted:
 *           type: string
 *         complement:
 *           type: string
 *           description: "Observações do cliente (ex: Sem cebola)"
 *         imgProd:
 *           type: string
 *         itemsCuston:
 *           type: array
 *           description: "Adicionais ou customizações do item"
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: integer
 *               price:
 *                 type: number
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         module:
 *           type: integer
 *           description: "Módulo do pedido: 1=Delivery, 2=Balcão, 3=Mesa"
 *         subTotal:
 *           type: number
 *         received:
 *           type: number
 *           description: "Valor líquido a ser recebido"
 *         discount:
 *           type: number
 *         cpf:
 *           type: string
 *         pagto:
 *           type: string
 *           description: "Método de pagamento: PIX, CREDIT, DEBIT, MONEY"
 *         table:
 *           type: integer
 *         codePassword:
 *           type: string
 *           description: "Senha de chamada (ex: S123)"
 *         phone:
 *           type: string
 *         stoneActive:
 *           type: boolean
 *         accessName:
 *           type: string
 *           description: "Nome do cliente"
 *         integrated:
 *           type: boolean
 *           description: "Informa se o pedido já foi puxado pelo ERP"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         transaction:
 *           type: object
 *           description: "Dados da transação caso tenha sido em cartão"
 *           properties:
 *             id:
 *               type: string
 *             method:
 *               type: string
 *             cardBrand:
 *               type: string
 *             installments:
 *               type: integer
 *             acquirerName:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: "Buscar Pedidos Pendentes"
 *     description: "Retorna a lista de todos os pedidos que AINDA NÃO FORAM marcados como integrados pelo seu ERP. Ideal para o sistema fazer o 'polling' (verificação contínua)."
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos pendentes carregada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: "Acesso Negado. Verifique se o Bearer Token está correto."
 */
router.get('/', async (req, res) => {
  const storeId = req.storeId;

  try {
    const { data: orders, error } = await supabase
      .from('APIGF_Pedidos')
      .select('*')
      .eq('fkStore', storeId)
      .eq('integrated', false)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/integrated:
 *   put:
 *     summary: "Confirmar Integração do Pedido"
 *     description: "Após o seu ERP receber e processar os dados do pedido, chame este endpoint para marcar o pedido como 'integrated: true'. Isso fará com que ele não apareça mais na listagem de pedidos pendentes."
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "O UUID do pedido que deseja confirmar"
 *     responses:
 *       200:
 *         description: "Sucesso. O pedido foi baixado da fila."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido marcado como integrado com sucesso."
 *       404:
 *         description: "O pedido informado não existe, ou não pertence à sua credencial."
 *       401:
 *         description: "Token inválido."
 */
router.put('/:id/integrated', async (req, res) => {
  const storeId = req.storeId;
  const { id } = req.params;

  try {
    const { data: order, error } = await supabase
      .from('APIGF_Pedidos')
      .update({ integrated: true })
      .eq('id', id)
      .eq('fkStore', storeId)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json({ message: 'Pedido marcado como integrado com sucesso.', order });
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
    res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: "Criar novo Pedido (Ambiente de Teste)"
 *     description: "Insere um novo pedido diretamente na sua loja (fkStore). Use isto para gerar dados falsos para testar a sua própria integração."
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: "Pedido de teste inserido com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: "Falha ao gravar pedido no banco."
 */
router.post('/', async (req, res) => {
  const storeId = req.storeId;
  const orderData = req.body;

  try {
    const { data: order, error } = await supabase
      .from('APIGF_Pedidos')
      .insert([
        {
          ...orderData,
          fkStore: storeId,
          integrated: false
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(order);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

module.exports = router;
