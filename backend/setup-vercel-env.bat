@echo off
echo Configurando variaveis de ambiente na Vercel...
echo.

vercel env add EFI_CLIENT_ID production
echo f3d9a3e99b4921ca027d5752473d530f0763f46c

vercel env add EFI_CLIENT_SECRET production
echo c4a8a472b03a0ee2c30f9bf4a881b3c6ffaa8d55

vercel env add EFI_PIX_KEY production
echo rikardomartinssantos@gmail.com

vercel env add EFI_CERT_PASSWORD production
echo.

vercel env add SUPABASE_URL production
echo https://eunbgdzfclupauicnqjx.supabase.co

vercel env add SUPABASE_SERVICE_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJnZHpmY2x1cGF1aWNucWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMzMTg3NCwiZXhwIjoyMDkwOTA3ODc0fQ.VS3eKc0r8O4s3J27TevRwNhX68tpN65C4C_oOWcrH9o

echo.
echo Configuracao concluida!
echo Agora execute: vercel --prod
pause
