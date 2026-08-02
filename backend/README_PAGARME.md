# Integração Pagar.me - Soma Fácil PRO

## Visão Geral

Backend para pagamento PRO via Pix usando Pagar.me API v5.

## Configuração

### 1. Obter Chave de API

1. Acesse [https://id.pagar.me/](https://id.pagar.me/) e faça login
2. Navegue até **Desenvolvimento** → **Chaves**
3. Copie a **Secret Key de Produção** (começa com `sk_`)
   - **Sandbox**: `sk_test_...` (para testes)
   - **Produção**: `sk_...` (para vendas reais)

### 2. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, adicione as seguintes variáveis:

```
PAGARME_API_KEY=sk_sua_chave_aqui
SUPABASE_URL=https://eunbgdzfclupauicnqjx.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key_aqui
```

**Importante**: Configure para **Production** e **Preview**.

### 3. Configurar Webhook na Pagar.me

1. No painel Pagar.me, vá em **Desenvolvimento** → **Webhooks**
2. Adicione a URL do webhook:
   ```
   https://calculadora-pro-ten.vercel.app/api/webhook-pagarme
   ```
3. Selecione os eventos:
   - ✅ `order.paid`
   - ✅ `charge.paid`

## Endpoints

### POST /api/create-payment

Cria uma cobrança Pix e retorna o QR Code.

**Request:**
```json
{
  "device_id": "android_1234567890"
}
```

**Response:**
```json
{
  "qrcode": "00020126580014br.gov.bcb.pix...",
  "qrcode_image": "data:image/png;base64,...",
  "txid": "or_abc123xyz"
}
```

### POST /api/webhook-pagarme

Recebe notificações da Pagar.me quando o pagamento é confirmado.

**Eventos processados:**
- `order.paid` - Pedido pago
- `charge.paid` - Cobrança paga

Quando recebe um desses eventos, ativa o PRO para o `device_id` no Supabase.

### GET /api/check-pro?device_id=xxx

Verifica se um device_id tem PRO ativo.

**Response:**
```json
{
  "is_pro": true
}
```

### GET /api/health

Status da configuração do backend.

**Response:**
```json
{
  "service": "soma-facil-backend",
  "ready": true,
  "backend_url": "https://...",
  "configuration": {
    "pagarme": true,
    "supabaseUrl": true,
    "supabaseServiceKey": true
  }
}
```

### GET /api/test-pagarme

Testa a conexão com a API da Pagar.me.

**Response:**
```json
{
  "timestamp": "2026-08-02T...",
  "apiKeySet": true,
  "apiKeyLength": 50,
  "apiKeyStart": "sk_...",
  "test": "SUCCESS",
  "message": "Pagar.me API key is valid and working"
}
```

## Fluxo de Pagamento

1. **App Flutter** chama `/api/create-payment` com `device_id`
2. **Backend** cria pedido na Pagar.me com:
   - Item: R$ 10,00 (1000 centavos)
   - Cliente: dados genéricos
   - Pagamento: Pix com expiração de 1 hora
   - Metadata: `device_id` para identificação
3. **Backend** retorna QR Code para o app
4. **App** exibe QR Code e inicia polling de 3 em 3 segundos
5. **Usuário** paga via app bancário
6. **Pagar.me** envia webhook `order.paid` para `/api/webhook-pagarme`
7. **Backend** ativa PRO no Supabase para o `device_id`
8. **App** detecta PRO ativo no próximo polling e fecha o paywall

## Documentação Pagar.me

- **API Reference**: https://docs.pagar.me/reference
- **Autenticação**: https://docs.pagar.me/reference/autenticação-2
- **Pix**: https://docs.pagar.me/reference/pix-2
- **Webhooks**: https://docs.pagar.me/reference/eventos-de-webhook-1

## Estrutura de Resposta da Pagar.me

### Criar Pedido (POST /core/v5/orders)

```json
{
  "id": "or_abc123",
  "code": "1234567",
  "amount": 1000,
  "status": "pending",
  "charges": [
    {
      "id": "ch_xyz789",
      "status": "pending",
      "last_transaction": {
        "transaction_type": "pix",
        "qr_code": "00020126580014br.gov.bcb.pix...",
        "qr_code_url": "https://api.pagar.me/qrcodes/..."
      }
    }
  ],
  "metadata": {
    "device_id": "android_1234567890"
  }
}
```

### Webhook order.paid

```json
{
  "id": "hook_abc",
  "type": "order.paid",
  "created_at": "2026-08-02T20:00:00",
  "data": {
    "id": "or_abc123",
    "code": "1234567",
    "status": "paid",
    "amount": 1000,
    "metadata": {
      "device_id": "android_1234567890"
    }
  }
}
```

## Troubleshooting

### Erro: "PAGARME_API_KEY not configured"
- Verifique se a variável está configurada na Vercel
- Faça redeploy após adicionar a variável

### Erro: "Pagar.me API error: 401"
- Chave de API inválida ou incorreta
- Verifique se copiou a Secret Key completa (começa com `sk_`)
- Teste com `/api/test-pagarme`

### Webhook não está funcionando
- Verifique se a URL do webhook está correta no painel Pagar.me
- Certifique-se que os eventos `order.paid` e `charge.paid` estão selecionados
- Verifique os logs da Vercel para ver se o webhook está chegando

### QR Code não aparece no app
- Teste o endpoint `/api/create-payment` diretamente
- Verifique os logs da Vercel
- Certifique-se que a response contém `qr_code` e `qr_code_url`

## Diferenças vs EFI/Asaas

| Feature | EFI | Asaas | Pagar.me |
|---------|-----|-------|----------|
| Autenticação | Certificate + Client ID/Secret | API Key no header | Basic Auth (Secret Key) |
| Complexidade | Alta (certificado .p12) | Média | Baixa |
| Endpoint | pix.api.efipay.com.br | api.asaas.com | api.pagar.me |
| QR Code | Endpoint separado | Endpoint separado | Na resposta do pedido |
| Webhook | Pix recebido | PAYMENT_CONFIRMED | order.paid / charge.paid |

## Próximos Passos

1. ✅ Obter Secret Key da Pagar.me
2. ✅ Configurar `PAGARME_API_KEY` na Vercel
3. ✅ Testar com `/api/test-pagarme`
4. ✅ Configurar webhook no painel Pagar.me
5. ✅ Fazer redeploy na Vercel
6. ✅ Testar fluxo completo no app
7. ✅ Gerar novo APK: `flutter build apk --release`
