# 🎯 FAÇA ISSO AGORA

## 1️⃣ Configurar na Vercel (2 minutos)

1. Acesse: **https://vercel.com/rikardomartin/calculadora-pro**
2. Clique em **Settings**
3. Clique em **Environment Variables**
4. Clique em **Add New**
5. Preencha:
   ```
   Name: MERCADOPAGO_ACCESS_TOKEN
   Value: APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277
   ```
6. Marque:
   - ✅ Production
   - ✅ Preview
7. Clique em **Save**

## 2️⃣ Aguardar Deploy (1-2 minutos)

A Vercel vai fazer deploy automaticamente.

Aguarde até ver **"Deployment Ready"** na aba **Deployments**.

## 3️⃣ Testar

Abra no navegador:

```
https://calculadora-pro-ten.vercel.app/api/test-mercadopago
```

### Se retornar SUCCESS ✅

Prossiga para configurar o webhook:

1. https://www.mercadopago.com.br/developers/panel/app
2. Sua aplicação → **Webhooks**
3. Adicionar webhook:
   - URL: `https://calculadora-pro-ten.vercel.app/api/webhook-mercadopago`
   - Evento: **payment**
4. Salvar
5. **Testar no app!**

### Se retornar erro 403 ❌

**Me envie o corpo completo da resposta de erro** que aparece na página.

Será algo como:
```json
{
  "test": "FAILED",
  "error": "Mercado Pago API error: 403 - {...}",
  ...
}
```

Copie TUDO e me mande.

## 📝 Nota sobre restrições da conta

Sua conta tem restrições para:
- "Acquire credit products"
- "Pay with credit or debit card"

**Isso NÃO bloqueia Pix!** Pix deve funcionar normalmente.

Se ainda assim der erro 403, pode ser que precise:
1. Cadastrar chave Pix (Email ou Telefone no Mercado Pago)
2. Ativar recebimento via Pix nas configurações
3. Completar dados cadastrais

---

## ✅ Checklist Rápido

- [ ] Configurei `MERCADOPAGO_ACCESS_TOKEN` na Vercel
- [ ] Aguardei o deploy terminar
- [ ] Testei o endpoint `/api/test-mercadopago`
- [ ] Se funcionou: Configurei webhook
- [ ] Se deu erro: Enviei o erro completo para você

**Vamos lá! 🚀**
