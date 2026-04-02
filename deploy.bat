@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [1/3] npm run build...
call npm run build
if errorlevel 1 exit /b 1

echo [2/3] Git add / commit...
git add -A
git diff --cached --quiet
if errorlevel 1 (
  if "%~1"=="" (
    echo.
    echo Aucun message de commit. Usage:
    echo   deploy.bat "ton message de commit"
    echo Les modifications restent en staging ^(git add -A deja fait^).
    exit /b 1
  )
  git commit -m "%~1"
  if errorlevel 1 exit /b 1
) else (
  echo Rien a committer ^(working tree propre^).
)

echo [3/3] git push...
git push
if errorlevel 1 exit /b 1

echo.
echo --- Deploiement auto Vercel ---
echo Sur https://vercel.com : ton projet ^> Settings ^> Git ^> Connect Repository
echo Choisis github.com/HeiNEYO/creo et branche Production = main.
echo Chaque "git push" sur main declenchera alors un deploiement automatique.
echo ^(Sans cette etape, seul "deploy-vercel.bat" ou la CLI deploie.^)
endlocal
