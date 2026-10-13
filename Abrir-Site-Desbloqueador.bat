@echo off
title Canon Picture Style Unlocker - Servidor Local
echo ========================================================
echo   Canon Picture Style Unlocker (Servidor Local)
echo ========================================================
echo.
echo Iniciando o servidor em http://localhost:5050 ...
echo Mantenha esta janela aberta enquanto estiver usando o site.
echo.

start http://localhost:5050
node "%~dp0server.js"
pause
