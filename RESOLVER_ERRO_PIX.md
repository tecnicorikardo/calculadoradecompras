# 🔴 COMO RESOLVER O ERRO "Não foi possível gerar o Pix"

## O problema

O erro aparece porque **as variáveis de ambiente não foram configuradas na Vercel**.

Sem essas variáveis, o backend não consegue se comunicar com a API da EFI (banco que gera o Pix).

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### 1️⃣ Abra este link:
https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro/settings/environment-variables

### 2️⃣ Clique no botão **"Add New"** (no canto superior direito)

### 3️⃣ Adicione cada variável abaixo (copie e cole exatamente):

#### Variável 1
```
Name: EFI_CLIENT_ID
Value: f3d9a3e99b4921ca027d5752473d530f0763f46c
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

#### Variável 2
```
Name: EFI_CLIENT_SECRET
Value: c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

#### Variável 3
```
Name: EFI_PIX_KEY
Value: rikardomartinssantos@gmail.com
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

#### Variável 4
```
Name: EFI_CERT_PASSWORD
Value: (deixe vazio)
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

#### Variável 5
```
Name: SUPABASE_URL
Value: https://eunbgdzfclupauicnqjx.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

#### Variável 6
```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJnZHpmY2x1cGF1aWNucWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMzMTg3NCwiZXhwIjoyMDkwOTA3ODc0fQ.VS3eKc0r8O4s3J27TevRwNhX68tpN65C4C_oOWcrH9o
Environments: ✓ Production ✓ Preview ✓ Development
```
➜ Clique **Save**

---

### 4️⃣ Fazer Redeploy

**Opção A - Via Dashboard (RECOMENDADO):**

1. Vá para: https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro
2. Clique em **"Deployments"**
3. No deployment mais recente (primeiro da lista), clique nos **3 pontinhos (⋮)**
4. Clique em **"Redeploy"**
5. Confirme clicando em **"Redeploy"** novamente
6. Aguarde 10-15 segundos até aparecer ✅ Ready

**Opção B - Via Terminal:**

```bash
cd C:\projetos\calculadora\backend
vercel --prod
```

Aguarde aparecer: ✅ Production

---

### 5️⃣ Testar

**No navegador:**
Acesse: https://calculadora-pro-ten.vercel.app/api/check-pro?device_id=test

✅ **Deve retornar**: `{"is_pro":false}`

**No app:**
1. Abra o app
2. Toque no badge "X dias grátis"
3. Toque em "Comprar PRO"
4. ✅ **Deve aparecer o QR Code!**

---

## 🎯 Resumo Visual

```
1. Abra: vercel.com → calculadora-pro → Settings → Environment Variables
2. Adicione 6 variáveis (copie e cole os valores acima)
3. Faça Redeploy (Deployments → ⋮ → Redeploy)
4. Teste no app
```

---

## ❓ Ainda com problema?

Me envie uma captura de tela de:
1. A página de Environment Variables (mostrando as 6 variáveis)
2. O erro no app

---

**Tempo estimado: 5 minutos**
**Dificuldade: Fácil (copiar e colar)**
