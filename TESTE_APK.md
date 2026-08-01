# Guia de Teste - Soma Fácil PRO com Pix EFI

## APK Gerado
✅ **Arquivo**: `build\app\outputs\flutter-apk\app-release.apk` (21.9MB)

## O que foi implementado

### 1. Sistema de Trial (30 dias gratuitos)
- Ao abrir o app pela primeira vez, inicia automaticamente o período de 30 dias grátis
- Badge no header mostra "X dias grátis restantes"
- Após 30 dias, aparece uma tela de bloqueio (paywall) exigindo upgrade para PRO

### 2. Pagamento via Pix EFI
- Backend hospedado na Vercel: `https://calculadora-pro-ten.vercel.app`
- Ao clicar em "Comprar PRO", gera um QR Code Pix instantaneamente
- QR Code é exibido direto no app (não abre navegador)
- Valor: R$ 10,00 (pagamento único vitalício)

### 3. Verificação automática de pagamento
- Após exibir o QR Code, o app verifica a cada 3 segundos se o pagamento foi confirmado
- Quando o pagamento é detectado, automaticamente:
  - Fecha a tela de pagamento
  - Ativa o status PRO localmente
  - Mostra notificação de sucesso

### 4. Banco de dados Supabase
- URL: `https://eunbgdzfclupauicnqjx.supabase.co`
- Armazena `device_id` dos usuários PRO na tabela `pro_users`

---

## Como testar o fluxo completo

### ⚠️ IMPORTANTE: Configurar variáveis de ambiente primeiro

Antes de testar, você precisa configurar o backend na Vercel:

1. Acesse: https://vercel.com/ricardos-projects-6af5d6cb/calculadora-pro/settings/environment-variables

2. Adicione as seguintes variáveis:

```
EFI_CLIENT_ID=f3d9a3e99b4921ca027d5752473d530f0763f46c
EFI_CLIENT_SECRET=c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55
EFI_PIX_KEY=rikardomartinssantos@gmail.com
EFI_CERT_PASSWORD=(deixe vazio)
SUPABASE_URL=https://eunbgdzfclupauicnqjx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJnZHpmY2x1cGF1aWNucWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMzMTg3NCwiZXhwIjoyMDkwOTA3ODc0fQ.VS3eKc0r8O4s3J27TevRwNhX68tpN65C4C_oOWcrH9o
```

3. Após adicionar as variáveis, faça um novo deploy:
```bash
cd backend
vercel --prod
```

---

### Teste 1: Trial de 30 dias

1. Instale o APK em um dispositivo novo (ou limpe os dados do app)
2. Abra o app
3. ✅ **Verificar**: Badge no header deve mostrar "30 dias grátis"
4. Use o app normalmente - deve funcionar sem restrições

### Teste 2: Gerar Pix e exibir QR Code

1. Toque no badge "X dias grátis" no header
2. Aparece o sheet "Soma Fácil PRO"
3. Toque em "Comprar acesso vitalício — R$ 10,00"
4. ✅ **Verificar**: 
   - Loading deve aparecer
   - Após 2-3 segundos, deve exibir um QR Code grande
   - Abaixo do QR Code: "Valor: R$ 10,00"
   - Botão "Copiar código Pix"
   - Texto "Aguardando pagamento..." com loading
5. ❌ **Se der erro**: Verifique se as variáveis de ambiente foram configuradas corretamente

### Teste 3: Copiar código Pix

1. Com o QR Code visível, toque em "Copiar código Pix"
2. ✅ **Verificar**: Snackbar "Código Pix copiado!"
3. Abra o app do banco e cole o código na área Pix

### Teste 4: Pagamento e ativação automática

#### Opção A: Pagamento real (R$ 10,00)

1. Use o app do banco para escanear o QR Code ou colar o código
2. Confirme o pagamento de R$ 10,00
3. ✅ **Verificar**:
   - Após 3-9 segundos, o sheet deve fechar automaticamente
   - Aparece snackbar verde: "Pagamento confirmado! Você agora é PRO! 🎉"
   - Badge no header some ou muda para indicador PRO

#### Opção B: Teste manual (sem pagar)

Se você quiser testar sem pagar, pode simular manualmente:

1. Com o QR Code visível no app, anote o `device_id` que foi gerado
2. Acesse o Supabase: https://eunbgdzfclupauicnqjx.supabase.co
3. Vá em "Table Editor" → "pro_users"
4. Clique em "Insert row" e adicione:
   - `device_id`: (o ID do seu dispositivo)
   - `activated_at`: (deixe o padrão, será preenchido automaticamente)
5. Salve
6. No app, aguarde até 9 segundos (3 verificações)
7. ✅ **Verificar**: O sheet deve fechar e mostrar sucesso

### Teste 5: Persistência do status PRO

1. Após ativar o PRO (por pagamento ou manualmente)
2. Feche completamente o app
3. Abra novamente
4. ✅ **Verificar**: Badge PRO ainda presente, sem solicitar pagamento

---

## Possíveis problemas e soluções

### Erro: "Não foi possível gerar o Pix"

**Causas:**
- Variáveis de ambiente não configuradas na Vercel
- Certificado `.p12` não foi enviado junto (está em `backend/producao-918763-somafacil.p12`)
- EFI API fora do ar

**Solução:**
1. Verifique as variáveis em: https://vercel.com/calculadora-pro/settings/environment-variables
2. Faça redeploy: `vercel --prod` na pasta `backend`
3. Teste a API diretamente: `curl https://calculadora-pro-ten.vercel.app/api/check-pro?device_id=test`

### Erro: "Pagamento não é detectado"

**Causas:**
- Webhook da EFI não está configurado
- Supabase não está acessível
- `device_id` diferente entre geração e webhook

**Solução:**
1. Configure webhook na EFI apontando para: `https://calculadora-pro-ten.vercel.app/api/webhook-pix`
2. Verifique se a tabela `pro_users` existe no Supabase
3. Use o teste manual (inserir direto no Supabase)

### QR Code não aparece

**Causas:**
- Dependência `qr_flutter` não foi instalada
- Erro no método `createPixPayment()`

**Solução:**
1. Verifique se `qr_flutter: ^4.1.0` está em `pubspec.yaml`
2. Rode `flutter pub get`
3. Rebuild: `flutter build apk --release`

---

## Arquitetura do sistema

```
┌─────────────┐
│   APP       │
│  Flutter    │  1. Gera device_id único
└──────┬──────┘  2. Verifica trial (30 dias)
       │         3. Cria pagamento Pix
       │         4. Exibe QR Code
       │         5. Polling a cada 3s
       │
       ▼
┌─────────────────────┐
│  BACKEND VERCEL     │
│  calculadora-pro    │
│                     │
│  /api/create-payment│ → Chama EFI → Retorna QR Code
│  /api/check-pro     │ → Consulta Supabase → is_pro?
│  /api/webhook-pix   │ → EFI notifica → Salva no Supabase
└──────┬──────────────┘
       │
       ▼
┌─────────────────┐         ┌─────────────┐
│  SUPABASE       │         │  EFI Bank   │
│  Database       │◄────────┤  Pix API    │
│                 │         │             │
│  pro_users      │         │ Webhook     │
│  - device_id    │         │ notifica    │
│  - activated_at │         │ pagamento   │
└─────────────────┘         └─────────────┘
```

---

## Próximos passos (se necessário)

1. **Configurar webhook na EFI**: Para que o pagamento seja detectado automaticamente
2. **Testar em produção**: Fazer um pagamento real de R$ 10,00
3. **Monitorar logs**: Verificar se webhook está sendo recebido
4. **Ajustar timeout**: Se 3 segundos for muito frequente, aumentar para 5s

---

## Credenciais EFI

- **Client ID**: `f3d9a3e99b4921ca027d5752473d530f0763f46c`
- **Client Secret**: `c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55`
- **Chave Pix**: `rikardomartinssantos@gmail.com`
- **Certificado**: `backend/producao-918763-somafacil.p12` (sem senha)

## Contatos do projeto

- **Email suporte**: tecnicorikardo@gmail.com
- **Telefone**: 21970902074
- **Repositório**: https://github.com/tecnicorikardo/calculadoradecompras
- **Backend**: https://calculadora-pro-ten.vercel.app
