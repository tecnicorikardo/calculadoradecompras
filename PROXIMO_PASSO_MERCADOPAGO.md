# 🚀 PRÓXIMO PASSO - Mercado Pago

## ✅ O que já está PRONTO

- ✅ **Código migrado** de Pagar.me para Mercado Pago
- ✅ **Backend atualizado** com:
  - `/api/create-payment` - Cria cobrança Pix
  - `/api/webhook-mercadopago` - Recebe confirmação
  - `/api/test-mercadopago` - Testa conexão
- ✅ **Código no GitHub** (já foi o push)
- ✅ **Access Token** obtido: `APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277`

## ⚠️ O que FALTA fazer

### 1. Configurar Chave Pix (OBRIGATÓRIO)

**Por quê:** O erro 403 indica que você precisa cadastrar uma chave Pix no Mercado Pago.

**Como fazer:**

1. Acesse: https://www.mercadopago.com.br/
2. Faça login
3. **Seu negócio** → **Configurações** → **Chaves Pix**
4. Cadastre uma chave:
   - Email: `tecnicorikardo@gmail.com`
   - ou Telefone: `21970902074`
   - ou CPF/CNPJ
5. Confirme o cadastro

**Documentação completa:** `backend/CONFIGURAR_MERCADOPAGO.md`

### 2. Configurar na Vercel

Depois de configurar a chave Pix:

1. Acesse: https://vercel.com/rikardomartin/calculadora-pro
2. **Settings** → **Environment Variables**
3. Adicione:
   ```
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277
   ```
4. Marque **Production** e **Preview**
5. Save

**Guia completo:** `CONFIGURAR_VERCEL_MERCADOPAGO.md`

### 3. Testar

Após configurar:

```
https://calculadora-pro-ten.vercel.app/api/test-mercadopago
```

Deve retornar: `"test": "SUCCESS"`

### 4. Configurar Webhook

1. https://www.mercadopago.com.br/developers/panel/app
2. Sua aplicação → **Webhooks**
3. URL: `https://calculadora-pro-ten.vercel.app/api/webhook-mercadopago`
4. Evento: **payment**
5. Salvar

### 5. Testar no App

1. Abrir app
2. "Ver Planos" → "Comprar acesso vitalício"
3. QR Code deve aparecer
4. Pagar R$ 10 via banco
5. App detecta e libera PRO

### 6. Gerar APK Final

```bash
flutter build apk --release
```

## 🎯 Ordem de Execução

```
1. Configurar chave Pix no Mercado Pago      ← COMECE AQUI
2. Configurar Access Token na Vercel
3. Aguardar deploy automático (1-2 min)
4. Testar endpoint /api/test-mercadopago
5. Configurar webhook
6. Testar no app
7. Gerar APK
```

## 📚 Documentação

- `backend/CONFIGURAR_MERCADOPAGO.md` - Como configurar chave Pix
- `CONFIGURAR_VERCEL_MERCADOPAGO.md` - Como configurar Vercel
- `backend/README_PAGARME.md` - Documentação técnica (adaptar para MP)

## 💬 Me avise quando:

- ✅ Configurar a chave Pix
- ✅ Configurar na Vercel
- ✅ Testar e der algum erro
- ✅ Conseguir fazer tudo funcionar

---

**🎉 Estamos QUASE LÁ!**

Só falta cadastrar a chave Pix no Mercado Pago e configurar na Vercel!

O Mercado Pago é MUITO mais fácil que EFI e Pagar.me:
- ✅ Sem certificado
- ✅ Apenas 1 token
- ✅ API simples
- ✅ Já está ativo para sua conta

Assim que cadastrar a chave Pix, vai funcionar! 🚀
