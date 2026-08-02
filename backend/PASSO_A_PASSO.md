# 🚀 Passo a Passo - Integração Pagar.me

## ✅ O que já está pronto

- ✅ Código atualizado para usar Pagar.me
- ✅ Endpoint `/api/create-payment` reescrito
- ✅ Webhook `/api/webhook-pagarme` criado
- ✅ Teste `/api/test-pagarme` criado
- ✅ Arquivos EFI removidos do .env.example

## 📋 O que você precisa fazer

### 1️⃣ Obter Chave da Pagar.me

1. Acesse: **https://id.pagar.me/**
2. Faça login
3. Vá em **Desenvolvimento** → **Chaves**
4. Copie a **Secret Key**:
   - Para testes: `sk_test_...`
   - Para produção: `sk_...`

### 2️⃣ Configurar na Vercel

1. Acesse: **https://vercel.com/rikardomartin/calculadora-pro**
2. Vá em **Settings** → **Environment Variables**
3. **REMOVA** as variáveis antigas:
   - ❌ `ASAAS_API_KEY`
   - ❌ `EFI_CLIENT_ID`
   - ❌ `EFI_CLIENT_SECRET`
   - ❌ `EFI_PIX_KEY`
   - ❌ `EFI_CERT_PASSWORD`
   - ❌ `EFI_CERT_PATH`
   - ❌ `EFI_CERT_BASE64`

4. **ADICIONE** a nova variável:
   ```
   Nome: PAGARME_API_KEY
   Valor: sk_sua_chave_aqui
   Environments: Production e Preview
   ```

### 3️⃣ Fazer Deploy

```bash
cd backend
git add .
git commit -m "Migrar para Pagar.me"
git push
```

Ou use o botão **Redeploy** na Vercel.

### 4️⃣ Testar a API

Abra no navegador:
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

### 5️⃣ Configurar Webhook

1. No painel da Pagar.me, vá em **Desenvolvimento** → **Webhooks**
2. Clique em **Adicionar Webhook**
3. Cole a URL:
   ```
   https://calculadora-pro-ten.vercel.app/api/webhook-pagarme
   ```
4. Selecione os eventos:
   - ✅ `order.paid`
   - ✅ `charge.paid`
5. Salve

### 6️⃣ Testar no App

1. Abra o app
2. Clique em **Ver Planos**
3. Clique em **Comprar acesso vitalício**
4. QR Code deve aparecer
5. Pague com app do banco (R$ 10,00)
6. App deve detectar pagamento e liberar PRO

### 7️⃣ Gerar novo APK

```bash
cd ..
flutter build apk --release
```

APK estará em: `build/app/outputs/flutter-apk/app-release.apk`

## 🔍 Verificações

### Health Check
```
https://calculadora-pro-ten.vercel.app/api/health
```
Deve mostrar `"pagarme": true`

### Test Pagar.me
```
https://calculadora-pro-ten.vercel.app/api/test-pagarme
```
Deve mostrar `"test": "SUCCESS"`

## ❗ Importante

- A Secret Key é **SECRETA** - não compartilhe
- Use `sk_test_...` para testes (não cobra de verdade)
- Use `sk_...` para produção (cobra de verdade)
- Mantenha as variáveis do Supabase:
  - ✅ `SUPABASE_URL`
  - ✅ `SUPABASE_SERVICE_KEY`

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs na Vercel (aba **Logs**)
2. Teste o endpoint `/api/test-pagarme`
3. Certifique-se que a chave está correta (começa com `sk_`)

---

**Pronto!** Agora o sistema usa Pagar.me, muito mais simples que EFI e Asaas! 🎉
