const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Usamos a SERVICE_ROLE_KEY no backend para ignorar o RLS quando necessário
// e podermos gerenciar os tokens com segurança.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Credenciais do Supabase não encontradas no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
