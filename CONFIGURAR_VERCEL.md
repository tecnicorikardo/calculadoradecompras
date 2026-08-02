# 🔧 Configurar Variáveis na Vercel

## 1️⃣ Acessar Configurações

1. Abra: **https://vercel.com/rikardomartin/calculadora-pro**
2. Clique na aba **Settings**
3. No menu lateral, clique em **Environment Variables**

## 2️⃣ Remover Variáveis Antigas (IMPORTANTE!)

Clique no **X** ou **Delete** para remover estas variáveis:

- ❌ `ASAAS_API_KEY`
- ❌ `EFI_CLIENT_ID`
- ❌ `EFI_CLIENT_SECRET`
- ❌ `EFI_PIX_KEY`
- ❌ `EFI_CERT_PASSWORD`
- ❌ `EFI_CERT_PATH`
- ❌ `EFI_CERT_BASE64`

## 3️⃣ Adicionar Nova Variável

Clique em **Add New** e preencha:

```
Name: PAGARME_API_KEY
Value: sk_128257d3e216448085a598a7b528feef
```

Marque os checkboxes:
- ✅ Production
- ✅ Preview
- ⬜ Development (opcional)

Clique em **Save**

## 4️⃣ Verificar Variáveis Necessárias

Certifique-se que estas variáveis **CONTINUAM CONFIGURADAS**:

```
✅ SUPABASE_URL=https://eunbgdzfclupauicnqjx.supabase.co
✅ SUPABASE_SERVICE_KEY=(sua chave do supabase)
✅ PAGARME_API_KEY=sk_128257d3e216448085a598a7b528feef (acabou de adicionar)
```

## 5️⃣ Fazer Redeploy

Há 2 opções:

### Opção A: Redeploy Automático (Recomendado)
A Vercel vai detectar o push no GitHub e fazer deploy automaticamente.
Aguarde 1-2 minutos.

### Opção B: Redeploy Manual
1. Vá na aba **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**
4. Confirme **Redeploy**

## 6️⃣ Testar

Após o deploy terminar (veja o status na aba Deployments), abra:

**Teste 1 - Health Check:**
```
https://calculadora-pro-ten.vercel.app/api/health
```

Deve mostrar:
```json
{
  "service": "soma-facil-backend",
  "ready": true,
  "configuration": {
    "pagarme": true,
    "supabaseUrl": true,
    "supabaseServiceKey": true
  }
}
```

**Teste 2 - Test Pagar.me:**
```
https://calculadora-pro-ten.vercel.app/api/test-pagarme
```

Deve mostrar:
```json
{
  "test": "SUCCESS",
  "message": "Pagar.me API key is valid and working"
}
```

## 7️⃣ Configurar Webhook

1. Acesse: **https://id.pagar.me/**
2. Faça login
3. Vá em **Desenvolvimento** → **Webhooks**
4. Clique em **Adicionar Webhook** (ou similar)
5. Cole a URL:
   ```
   https://calculadora-pro-ten.vercel.app/api/webhook-pagarme
   ```
6. Selecione os eventos:
   - ✅ `order.paid`
   - ✅ `charge.paid`
7. Salve

## ✅ Pronto!

Agora pode testar o fluxo completo no app:

1. Abrir app
2. Clicar em "Ver Planos"
3. Clicar em "Comprar acesso vitalício"
4. QR Code deve aparecer
5. Pagar R$ 10,00 via app do banco
6. App deve detectar e liberar PRO automaticamente

---

**🎉 Pagar.me é MUITO mais simples que EFI!**

- ✅ Sem certificado .p12
- ✅ Apenas 1 chave de API
- ✅ QR Code vem direto na resposta
- ✅ Webhook simples

Se tiver algum erro, me avise que eu te ajudo! 🚀
