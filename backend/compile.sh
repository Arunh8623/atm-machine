#!/bin/bash

echo "Compiling C++ Calculator Server..."

# Compile the server
g++ -std=c++11 server.cpp -o server -pthread

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo "Run './server' to start the backend server"
else
    echo "❌ Compilation failed!"
    exit 1
fi