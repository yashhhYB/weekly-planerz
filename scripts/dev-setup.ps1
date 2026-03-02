# Weekly Planner - Development Setup Script (Windows PowerShell)

Write-Host "🚀 Weekly Planner - Development Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "✓ Checking prerequisites..." -ForegroundColor Cyan

$programs = @("git", "dotnet", "node")
foreach ($prog in $programs) {
    if (-not (Get-Command $prog -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $prog not found. Please install it." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ All prerequisites found" -ForegroundColor Green
Write-Host ""

# Backend setup
Write-Host "📦 Setting up Backend (.NET)..." -ForegroundColor Cyan
Set-Location backend
dotnet restore
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Frontend setup
Write-Host "📦 Setting up Frontend (Angular)..." -ForegroundColor Cyan
Set-Location ../frontend
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Database setup
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "Docker required. Run locally:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d db" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start database: docker-compose up -d db" -ForegroundColor White
Write-Host "2. Update backend DB: cd backend && dotnet ef database update" -ForegroundColor White
Write-Host "3. Run backend: cd backend && dotnet run" -ForegroundColor White
Write-Host "4. Run frontend: cd frontend && npm start" -ForegroundColor White
Write-Host ""
