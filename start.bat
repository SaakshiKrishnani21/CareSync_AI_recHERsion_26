@echo off
title CareSync AI
cd /d "%~dp0backend"
set PY=python
where python >nul 2>nul || set PY=py -3
%PY% --version >nul 2>nul || (echo Python is not installed. Install Python 3.12 from python.org and tick "Add python.exe to PATH". & pause & exit /b 1)
echo Installing requirements (first time takes a minute)...
%PY% -m pip install -q -r requirements.txt || (echo. & echo Install failed. Read the message above, or send it to your helper. & pause & exit /b 1)
if not exist .env copy .env.example .env >nul
findstr /b /c:"ANTHROPIC_API_KEY=sk-ant" .env >nul || echo WARNING: no Anthropic key in backend\.env. Login and booking work, but AI reports and the assistant need it.
echo Starting CareSync at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000
%PY% -m uvicorn main:app --port 8000
pause
