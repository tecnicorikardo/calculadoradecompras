# ⚠️ URGENTE: Configurar Variáveis de Ambiente na Vercel

## O erro que você viu significa que as variáveis de ambiente não estão configuradas!

Siga estes passos **EXATAMENTE**:

---

## Passo 1: Acessar Configurações do Projeto

1. Acesse: https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro/settings/environment-variables

2. OU navegue manualmente:
   - Vá em https://vercel.com
   - Clique no projeto **calculadora-pro**
   - Clique em **Settings** (no topo)
   - Clique em **Environment Variables** (menu lateral esquerdo)

---

## Passo 2: Adicionar as Variáveis (uma por uma)

Clique em **Add New** e adicione cada variável abaixo:

### Variável 1: EFI_CLIENT_ID
- **Name**: `EFI_CLIENT_ID`
- **Value**: `f3d9a3e99b4921ca027d5752473d530f0763f46c`
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

### Variável 2: EFI_CLIENT_SECRET
- **Name**: `EFI_CLIENT_SECRET`
- **Value**: `c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55`
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

### Variável 3: EFI_PIX_KEY
- **Name**: `EFI_PIX_KEY`
- **Value**: `rikardomartinssantos@gmail.com`
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

### Variável 4: EFI_CERT_PASSWORD
- **Name**: `EFI_CERT_PASSWORD`
- **Value**: (deixe VAZIO - não coloque nada)
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

### Variável 5: SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Value**: `https://eunbgdzfclupauicnqjx.supabase.co`
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

### Variável 6: SUPABASE_SERVICE_KEY
- **Name**: `SUPABASE_SERVICE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJnZHpmY2x1cGF1aWNucWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMzMTg3NCwiZXhwIjoyMDkwOTA3ODc0fQ.VS3eKc0r8O4s3J27TevRwNhX68tpN65C4C_oOWcrH9o`
- **Environment**: ☑ Production ☑ Preview ☑ Development
- Clique em **Save**

---

## Passo 3: Fazer Redeploy

**IMPORTANTE**: Após adicionar as variáveis, você PRECISA fazer um novo deploy!

### Opção A: Via Vercel Dashboard (mais fácil)

1. Vá para https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro
2. Clique na aba **Deployments**
3. Clique nos 3 pontinhos (...) do deployment mais recente
4. Clique em **Redeploy**
5. Clique em **Redeploy** novamente para confirmar

### Opção B: Via terminal

```bash
cd C:\projetos\calculadora\backend
vercel --prod
```

---

## Passo 4: Testar se funcionou

Após o redeploy, teste a API diretamente:

1. Abra o navegador
2. Acesse: https://calculadora-pro-ten.vercel.app/api/check-pro?device_id=test
3. Deve retornar: `{"is_pro":false}`

Se retornar um JSON, está funcionando! ✅

---

## Passo 5: Testar no App

1. Abra o app no celular
2. Toque no badge de trial
3. Toque em "Comprar PRO"
4. Agora deve aparecer o QR Code! 🎉

---

## Se ainda der erro...

### Erro: "Cannot find module 'https'"

Significa que a Vercel não reconheceu como função Node.js. 

**Solução**: O arquivo `vercel.json` já foi corrigido no último commit. Faça um redeploy.

### Erro: "Cannot read certificate"

Significa que o arquivo `.p12` não foi enviado para a Vercel.

**Solução**: O arquivo está commitado em `backend/producao-918763-somafacil.p12`. A Vercel vai pegar do Git automaticamente.

### Erro: "401 Unauthorized" da EFI

Significa que Client ID ou Client Secret estão errados.

**Solução**: Verifique se copiou EXATAMENTE as credenciais acima.

---

## Credenciais de referência

Se precisar verificar novamente:

```
EFI_CLIENT_ID=f3d9a3e99b4921ca027d5752473d530f0763f46c
EFI_CLIENT_SECRET=c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55
EFI_PIX_KEY=rikardomartinssantos@gmail.com
EFI_CERT_PASSWORD=(vazio)
SUPABASE_URL=https://eunbgdzfclupauicnqjx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJnZHpmY2x1cGF1aWNucWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMzMTg3NCwiZXhwIjoyMDkwOTA3ODc0fQ.VS3eKc0r8O4s3J27TevRwNhX68tpN65C4C_oOWcrH9o
```

---

## ✅ Checklist

- [ ] Acessei https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro/settings/environment-variables
- [ ] Adicionei as 6 variáveis de ambiente
- [ ] Marquei Production, Preview e Development em todas
- [ ] Fiz um Redeploy
- [ ] Testei https://calculadora-pro-ten.vercel.app/api/check-pro?device_id=test
- [ ] Testei no app e o QR Code apareceu

---

**Qualquer dúvida, me avise! Mas siga EXATAMENTE estes passos primeiro.**
