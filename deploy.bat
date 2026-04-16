@echo off
setlocal
cd /d "%~dp0"

if not exist ".vercel\project.json" (
  echo ERREUR: Ce dossier n'est pas lie a un projet Vercel.
  echo Lance depuis la racine du repo :  npx vercel link
  echo ^(Le dossier .vercel est local et ne part pas sur Git — normal.^)
  exit /b 1
)

echo [CREO] Build local ^(obligatoire apres toute modif design / UI^)...
call npm run build
if errorlevel 1 (
  echo [CREO] Echec du build.
  exit /b 1
)

echo.
echo [CREO] Deploiement Vercel production...
call npx vercel --prod --yes
set EXIT=%ERRORLEVEL%
if %EXIT% neq 0 (
  echo [CREO] Echec du deploiement ^(code %EXIT%^).
  exit /b %EXIT%
)
echo [CREO] Deploiement termine.
exit /b 0
