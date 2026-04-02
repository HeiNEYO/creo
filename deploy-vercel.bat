@echo off
setlocal
cd /d "%~dp0"

if not exist ".vercel\project.json" (
  echo ERREUR: Ce dossier n'est pas lie a un projet Vercel.
  echo Lance depuis ICI:  npx vercel link
  echo ^(Le dossier .vercel est local et ne part pas sur Git — normal.^)
  exit /b 1
)

echo Build local...
call npm run build
if errorlevel 1 exit /b 1
echo.
echo Deploiement production Vercel...
call npx vercel --prod
endlocal
