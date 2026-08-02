# 🔧 Configurar Vercel - Mercado Pago

## 1️⃣ Acessar Configurações

1. Abra: **https://vercel.com/rikardomartin/calculadora-pro**
2. Clique na aba **Settings**
3. No menu lateral, clique em **Environment Variables**

## 2️⃣ Remover Variáveis Antigas

Clique no **X** ou **Delete** para remover:

- ❌ `PAGARME_API_KEY`
- ❌ Qualquer outra relacionada a Pagar.me, EFI ou Asaas

## 3️⃣ Adicionar Variável do Mercado Pago

Clique em **Add New** e preencha:

```
Name: MERCADOPAGO_ACCESS_TOKEN
Value: APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277
```

Marque os checkboxes:
- ✅ Production
- ✅ Preview

Clique em **Save**

## 4️⃣ Verificar Variáveis

Certifique-se que estas variáveis estão configuradas:

```
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_KEY
✅ MERCADOPAGO_ACCESS_TOKEN (acabou de adicionar)
```

## 5️⃣ Redeploy

A Vercel vai detectar automaticamente o push no GitHub e fazer deploy.

Aguarde 1-2 minutos.

## 6️⃣ Testar

Após o deploy:

```
https://calculadora-pro-ten.vercel.app/api/health
https://calculadora-pro-ten.vercel.app/api/test-mercadopago
```

## 7️⃣ Configurar Webhook (Depois que funcionar)

1. Acesse: **https://www.mercadopago.com.br/developers/panel/app**
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Cole a URL:
   ```
   https://calculadora-pro-ten.vercel.app/api/webhook-mercadopago
   ```
5. Selecione o evento: **payment**
6. Salve

---

**⚠️ ANTES DE FAZER ISSO:**

Você precisa configurar a **chave Pix** no Mercado Pago!

Ver: `backend/CONFIGURAR_MERCADOPAGO.md`
