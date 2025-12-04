#!/bin/bash

# GRAPTS Setup Script for macOS/Linux
# This script installs all dependencies for client and server

echo "GRAPTS Setup - Installing all dependencies..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

# Install client dependencies
echo ""
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install client dependencies"
    cd ..
    exit 1
fi
cd ..

# Install server dependencies
echo ""
echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install server dependencies"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "To start development with both client and server:"
echo "  npm run dev"
echo ""
echo "Or start them separately:"
echo "  npm run dev:client  (in one terminal)"
echo "  npm run dev:server  (in another terminal)"
