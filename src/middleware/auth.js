const { supabase } = require('../supabase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Busca o token na tabela APIGF_ApiTokens
    const { data: tokenData, error } = await supabase
      .from('APIGF_ApiTokens')
      .select('fkStore, active')
      .eq('token', token)
      .single();

    if (error || !tokenData) {
      return res.status(403).json({ error: 'Token inválido ou não autorizado.' });
    }

    if (!tokenData.active) {
      return res.status(403).json({ error: 'Token desativado.' });
    }

    // Adiciona o ID da loja na requisição para filtrar os pedidos nas rotas
    req.storeId = tokenData.fkStore;
    next();
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(500).json({ error: 'Erro interno na validação de autenticação.' });
  }
};

module.exports = authenticateToken;
