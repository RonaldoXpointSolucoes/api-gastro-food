const express = require('express');
const { supabase } = require('../supabase');
const crypto = require('crypto');
const router = express.Router();

// GET /api/admin/tokens - Lista todos os tokens
router.get('/tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('APIGF_ApiTokens')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar tokens:', err);
    res.status(500).json({ error: 'Erro ao buscar tokens.' });
  }
});

// POST /api/admin/tokens - Cria um novo token
router.post('/tokens', async (req, res) => {
  const { fkStore, softwareName } = req.body;

  if (!fkStore) {
    return res.status(400).json({ error: 'O campo fkStore é obrigatório.' });
  }

  // Gera um token seguro de 64 caracteres
  const token = crypto.randomBytes(32).toString('hex');

  try {
    const { data, error } = await supabase
      .from('APIGF_ApiTokens')
      .insert([
        {
          fkStore,
          softwareName: softwareName || 'Não Informado',
          token,
          active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Erro ao criar token:', err);
    res.status(500).json({ error: 'Erro interno ao criar credencial.' });
  }
});

// DELETE /api/admin/tokens/:id - Desativa/Remove um token
router.delete('/tokens/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('APIGF_ApiTokens')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Token removido com sucesso!', data });
  } catch (err) {
    console.error('Erro ao excluir token:', err);
    res.status(500).json({ error: 'Erro interno ao excluir credencial.' });
  }
});

// GET /api/admin/orders/:fkStore - Lista os pedidos de uma loja (últimos 50)
router.get('/orders/:fkStore', async (req, res) => {
  const { fkStore } = req.params;
  try {
    const { data, error } = await supabase
      .from('APIGF_Pedidos')
      .select('*')
      .eq('fkStore', fkStore)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar pedidos da loja:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

module.exports = router;
