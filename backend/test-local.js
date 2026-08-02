// Script para testar a integração Mercado Pago localmente
const https = require('https');
const crypto = require('crypto');

const MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277';

console.log('🔍 Testando Mercado Pago API...\n');

// Teste: Criar Pagamento Pix
async function testCreatePayment() {
  console.log('💳 Testando criação de pagamento Pix...');
  
  try {
    const idempotencyKey = crypto.randomUUID();
    
    const paymentBody = JSON.stringify({
      transaction_amount: 10.00,
      description: 'Soma Facil PRO - Teste',
      payment_method_id: 'pix',
      payer: {
        email: 'teste@somafacil.app',
        first_name: 'Cliente',
        last_name: 'Teste',
        identification: {
          type: 'CPF',
          number: '00000000000'
        }
      },
      external_reference: 'test_device_123',
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mercadopago.com',
        port: 443,
        path: '/v1/payments',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'Content-Length': Buffer.byteLength(paymentBody),
        },
      };

      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(paymentBody);
      req.end();
    });

    console.log('✅ Pagamento criado com sucesso!');
    console.log(`   Payment ID: ${result.id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Status Detail: ${result.status_detail}`);
    
    if (result.point_of_interaction?.transaction_data) {
      const pix = result.point_of_interaction.transaction_data;
      console.log(`   QR Code: ${pix.qr_code ? 'Gerado ✓' : 'Não gerado ✗'}`);
      console.log(`   QR Code Base64: ${pix.qr_code_base64 ? 'Gerado ✓' : 'Não gerado ✗'}`);
      console.log(`   Ticket URL: ${pix.ticket_url || 'N/A'}`);
      
      if (pix.qr_code) {
        console.log(`\n📱 Copie o QR Code abaixo para testar no app do banco:`);
        console.log(`\n${pix.qr_code}\n`);
      }
    }
    
    console.log();
    return true;
  } catch (error) {
    console.log('❌ Erro ao criar pagamento:');
    console.log(`   ${error.message}\n`);
    return false;
  }
}

// Executar teste
async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  TESTE DE INTEGRAÇÃO MERCADO PAGO');
  console.log('═══════════════════════════════════════════\n');
  
  const paymentOk = await testCreatePayment();
  
  if (paymentOk) {
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ TESTE PASSOU COM SUCESSO!');
    console.log('═══════════════════════════════════════════\n');
    console.log('Próximos passos:');
    console.log('1. Configure o Access Token na Vercel');
    console.log('2. Faça deploy do backend');
    console.log('3. Configure o webhook no painel Mercado Pago');
    console.log('4. Teste no app Flutter\n');
  } else {
    console.log('═══════════════════════════════════════════');
    console.log('  ❌ TESTE FALHOU');
    console.log('═══════════════════════════════════════════\n');
    console.log('Verifique se o Access Token está correto.\n');
  }
}

runTests();
