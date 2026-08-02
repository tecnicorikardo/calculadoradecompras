# ⚠️ Conta Pagar.me precisa ser ativada

## Problema Atual

A chave de API está correta, mas está retornando erro **401 Unauthorized**.

Isso significa que sua conta Pagar.me **ainda não está totalmente ativa** para processar transações.

## Chave que você tem

```
sk_128257d3e216448085a598a7b528feef
```

✅ Formato correto
❌ Sem autorização para criar pedidos

## O que fazer

### 1️⃣ Verificar Status da Conta

1. Acesse: **https://id.pagar.me/**
2. Faça login
3. Procure por:
   - ⚠️ Avisos de "Conta em análise"
   - ⚠️ Mensagens de "Dados pendentes"
   - ⚠️ "KYC incompleto" (Know Your Customer)

### 2️⃣ Completar Cadastro

A Pagar.me precisa de informações da sua empresa/pessoa:

- 📄 **CNPJ** ou **CPF**
- 🏦 **Dados bancários** (para receber os pagamentos)
- 📱 **Telefone de contato**
- 📧 **Email confirmado**
- 🆔 **Documentos** (pode ser solicitado)

**Caminho no painel:**
- **Configurações** → **Dados da Conta**
- ou **Onboarding** / **Completar Cadastro**

### 3️⃣ Ativar Ambiente de Produção

Pode ser que você precise:

1. Solicitar ativação do ambiente de produção
2. Assinar contrato online
3. Aguardar aprovação (1-2 dias úteis)

**No painel:**
- Procure por **"Ambiente de Produção"**
- ou **"Solicitar Ativação"**

### 4️⃣ Usar Ambiente de Teste (Alternativa)

Enquanto aguarda ativação, você pode usar **chave de teste**:

1. No painel, vá em **Desenvolvimento** → **Chaves**
2. Procure por **"Chave de Teste"** ou **"Sandbox"**
3. Copie a chave que começa com `sk_test_...`
4. Use essa chave para testar (não cobra de verdade)

## Contato Pagar.me

Se não conseguir resolver sozinho:

📧 **Email**: suporte@pagar.me
💬 **Chat**: Disponível no painel após login
📞 **Telefone**: Verifique no site oficial

**O que informar ao suporte:**
- Sua conta está retornando 401 ao tentar criar pedidos
- Você já tem a chave de API mas não consegue usá-la
- Precisa ativar a conta para produção

## Alternativa: Usar Stripe ou Mercado Pago

Se a Pagar.me estiver demorando muito para ativar, posso te ajudar a implementar com:

- **Mercado Pago** (mais fácil de ativar)
- **Stripe** (internacional, mas aceita Brasil)

Ambos têm processo de ativação mais rápido.

---

**🎯 Próximo passo:**

1. Complete o cadastro no painel Pagar.me
2. Solicite ativação para produção
3. OU use chave de teste enquanto aguarda
4. OU me avise se quiser mudar para outro gateway

Me avise quando conseguir ativar a conta! 🚀
