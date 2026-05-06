const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stores = [
  '28c61c90-ea26-41b7-83e1-0342e052a7a1',
  '550e8400-e29b-41d4-a716-446655440000',
  '123e4567-e89b-12d3-a456-426614174000'
];

const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Beatriz', 'Lucas', 'Fernanda', 'Rafael', 'Camila'];
const payments = ['PIX', 'CREDIT', 'DEBIT', 'MONEY'];
const itemsBase = [
  { name: 'X-Burger Artesanal Duplo', price: 35.90, img: 'https://placehold.co/100x100?text=Burger' },
  { name: 'Batata Frita com Cheddar e Bacon', price: 22.50, img: 'https://placehold.co/100x100?text=Fries' },
  { name: 'Refrigerante Cola 350ml', price: 6.00, img: 'https://placehold.co/100x100?text=Coke' },
  { name: 'Sundae Morango', price: 12.00, img: 'https://placehold.co/100x100?text=Sundae' },
  { name: 'Combo Casal (2x Burger + Fritas)', price: 65.00, img: 'https://placehold.co/100x100?text=Combo' },
  { name: 'Onion Rings Porção', price: 18.00, img: 'https://placehold.co/100x100?text=Onion' },
  { name: 'Milkshake de Ovomaltine', price: 16.00, img: 'https://placehold.co/100x100?text=Shake' },
  { name: 'X-Salada Tradicional', price: 21.00, img: 'https://placehold.co/100x100?text=Salada' }
];

function generateOrders() {
  const orders = [];
  for (const store of stores) {
    for (let i = 0; i < 50; i++) {
      const itemsCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 items
      const orderItems = [];
      let subTotal = 0;
      
      for (let j = 0; j < itemsCount; j++) {
        const itemObj = itemsBase[Math.floor(Math.random() * itemsBase.length)];
        const amount = Math.floor(Math.random() * 3) + 1;
        const totalItemPrice = itemObj.price * amount;
        subTotal += totalItemPrice;
        
        orderItems.push({
          id: crypto.randomUUID(),
          code: `PRD-${Math.floor(Math.random() * 9000) + 1000}`,
          codePdv: `PDV-${Math.floor(Math.random() * 900) + 100}`,
          name: itemObj.name,
          amount: amount,
          unitary: itemObj.price.toFixed(2),
          price: Number(totalItemPrice.toFixed(2)),
          priceFormatted: `R$ ${totalItemPrice.toFixed(2).replace('.', ',')}`,
          complement: Math.random() > 0.5 ? 'Sem cebola' : 'Com bastante molho',
          imgProd: itemObj.img,
          itemsCuston: Math.random() > 0.7 ? [{
            id: crypto.randomUUID(),
            code: `ADIC-${Math.floor(Math.random() * 100)}`,
            codePdv: `ADPDV-${Math.floor(Math.random() * 100)}`,
            name: 'Bacon Extra',
            amount: 1,
            price: 4.50,
            numberPasso: 1,
            typeCalc: 1
          }] : []
        });
      }

      const discount = Math.random() > 0.8 ? 5.00 : 0;
      const received = subTotal - discount;
      const currentPagto = payments[Math.floor(Math.random() * payments.length)];

      orders.push({
        module: Math.floor(Math.random() * 3) + 1, // 1: Delivery, 2: Balcão, 3: Mesa
        fkStore: store,
        subTotal: Number(subTotal.toFixed(2)),
        received: Number(received.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        cpf: `${Math.floor(Math.random()*999)}.${Math.floor(Math.random()*999)}.${Math.floor(Math.random()*999)}-${Math.floor(Math.random()*99)}`,
        pagto: currentPagto,
        table: Math.floor(Math.random() * 30) + 1,
        codePassword: `S${Math.floor(Math.random() * 900) + 100}`,
        phone: `119${Math.floor(Math.random() * 90000000) + 10000000}`,
        stoneActive: currentPagto === 'CREDIT' || currentPagto === 'DEBIT',
        accessName: names[Math.floor(Math.random() * names.length)],
        integrated: false,
        transaction: (currentPagto === 'CREDIT' || currentPagto === 'DEBIT') ? {
          id: crypto.randomUUID(),
          method: currentPagto,
          cardBrand: Math.random() > 0.5 ? 'MASTERCARD' : 'VISA',
          installments: currentPagto === 'CREDIT' ? Math.floor(Math.random() * 3) + 1 : 1,
          acquirerName: 'STONE',
          acquirerCode: 'STN',
          acquirerDocument: '16.089.332/0001-52'
        } : null,
        items: orderItems
      });
    }
  }
  return orders;
}

async function run() {
  const orders = generateOrders();
  console.log(`Gerados ${orders.length} pedidos. Iniciando inserção no banco...`);
  
  // Inserção em lotes (chunks)
  let successCount = 0;
  for (let i = 0; i < orders.length; i += 50) {
    const chunk = orders.slice(i, i + 50);
    const { data, error } = await supabase.from('APIGF_Pedidos').insert(chunk);
    
    if (error) {
      console.error(`Erro ao inserir lote ${Math.floor(i/50)+1}:`, error);
    } else {
      successCount += chunk.length;
      console.log(`Lote ${Math.floor(i/50)+1} inserido com sucesso.`);
    }
  }
  
  console.log(`✅ Concluído! Total inserido: ${successCount} registros.`);
}

run();
