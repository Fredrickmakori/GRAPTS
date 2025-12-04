# GRAPTS Setup Script for Windows PowerShell
# This script installs all dependencies for client and server

Write-Host "GRAPTS Setup - Installing all dependencies..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Node version: $(node --version)" -ForegroundColor Green
Write-Host "npm version: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install client dependencies
Write-Host ""
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
cd client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install client dependencies" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..

# Install server dependencies
Write-Host ""
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
cd server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install server dependencies" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development with both client and server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or start them separately:" -ForegroundColor Cyan
Write-Host "  npm run dev:client  (in one terminal)" -ForegroundColor Yellow
Write-Host "  npm run dev:server  (in another terminal)" -ForegroundColor Yellow
