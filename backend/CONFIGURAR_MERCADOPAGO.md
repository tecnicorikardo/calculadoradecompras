# 🔧 Configurar Mercado Pago - PASSO A PASSO

## ⚠️ Erro Atual

```
403 - PolicyAgent - UNAUTHORIZED
"At least one policy returned UNAUTHORIZED"
```

**Isso significa:** Sua conta Mercado Pago precisa de configuração adicional para aceitar Pix.

## 📋 O que você precisa fazer

### 1️⃣ Configurar Chave Pix

Para aceitar pagamentos via Pix, você PRECISA cadastrar sua chave Pix no Mercado Pago:

1. Acesse: **https://www.mercadopago.com.br/**
2. Faça login
3. Vá em **Seu negócio** → **Configurações**
4. Procure por **"Chaves Pix"** ou **"Meios de recebimento"**
5. Adicione uma chave Pix:
   - Pode ser: CPF, CNPJ, Email, Telefone ou Chave aleatória
   - **Importante**: Use uma chave que você tenha acesso!

### 2️⃣ Ativar Recebimento via Pix

1. No painel Mercado Pago
2. **Seu negócio** → **Preferências**
3. Certifique-se que **Pix está habilitado** como meio de pagamento

### 3️⃣ Completar Cadastro

O Mercado Pago pode exigir:

- ✅ CPF ou CNPJ cadastrado
- ✅ Dados bancários (para receber pagamentos)
- ✅ Email confirmado
- ✅ Telefone confirmado
- ✅ Documentos (se solicitado)

**Caminho**: **Seu negócio** → **Dados da conta**

### 4️⃣ Verificar Credenciais

Certifique-se que está usando as credenciais corretas:

1. Acesse: **https://www.mercadopago.com.br/developers/panel/app**
2. Selecione sua aplicação (ou crie uma nova)
3. Vá em **Credenciais** → **Credenciais de produção**
4. Copie o **Access Token** (começa com `APP_USR-...`)

**Sua chave atual:**
```
APP_USR-8124126164184368-040416-3c7856b4ccbdd285ce9fd54d6480ea2a-466908277
```

Se essa chave for de **teste**, você precisa pegar a de **produção**!

### 5️⃣ Testar com Credenciais de Teste (Alternativa)

Enquanto configura a produção, você pode testar com credenciais de teste:

1. **Credenciais** → **Credenciais de teste**
2. Copie o **Access Token de teste**
3. Use para testar (não cobra de verdade)

## 🧪 Depois de Configurar

1. **Teste localmente:**
   ```bash
   cd backend
   node test-local.js
   ```

2. **Configure na Vercel:**
   - Adicione `MERCADOPAGO_ACCESS_TOKEN`
   - Use o Access Token de **produção**

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Migrar para Mercado Pago"
   git push
   ```

4. **Teste os endpoints:**
   ```
   https://calculadora-pro-ten.vercel.app/api/health
   https://calculadora-pro-ten.vercel.app/api/test-mercadopago
   ```

## 📞 Suporte Mercado Pago

Se ainda tiver problemas:

**Central de Ajuda:**
- https://www.mercadopago.com.br/ajuda

**Chat de Suporte:**
- Disponível após login no painel

**O que informar:**
- Erro 403 ao tentar criar pagamento Pix
- Access Token está configurado mas retorna "UNAUTHORIZED"
- Precisa ativar Pix para receber pagamentos

## ✅ Checklist

Antes de testar novamente, verifique:

- [ ] Chave Pix cadastrada no Mercado Pago
- [ ] Pix habilitado como meio de pagamento
- [ ] Cadastro completo (CPF/CNPJ, dados bancários)
- [ ] Access Token de PRODUÇÃO (não teste)
- [ ] Email e telefone confirmados

## 🎯 Próximos Passos

Depois que configurar tudo:

1. Me avise que configurou
2. Testamos juntos
3. Configuramos na Vercel
4. Testamos no app
5. Geramos o APK final

---

**💡 Dica:** Se Mercado Pago estiver muito complicado, podemos tentar outro gateway. Mas geralmente é só configurar a chave Pix que funciona!
