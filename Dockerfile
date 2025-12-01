FROM gcc:latest

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy source files from backend directory
COPY backend/httplib.h .
COPY backend/server.cpp .

# Compile the C++ server
RUN g++ -std=c++11 server.cpp -o server -pthread

# Expose port
EXPOSE 8081

# Run the server
CMD ["./server"]