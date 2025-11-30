@echo off
echo Compiling C++ Calculator Server...

g++ -std=c++11 server.cpp -o server.exe -lws2_32

if %errorlevel% == 0 (
    echo.
    echo ✅ Compilation successful!
    echo Run 'server.exe' to start the backend server
) else (
    echo.
    echo ❌ Compilation failed!
    pause
    exit /b 1
)

pause