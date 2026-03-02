# Status Check Script
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Weekly Planner - Setup Progress Monitor                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check PostgreSQL Server Status
Write-Host "PostgreSQL Server Status:" -ForegroundColor Cyan
try {
    $pgStatus = az postgres flexible-server show --name weeklyplanner-db --resource-group weeklyplanner-rg 2>&1
    if ($pgStatus -match "was not found") {
        Write-Host "  ⏳ Still creating... (typically takes 5-10 minutes)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ PostgreSQL server created successfully!" -ForegroundColor Green
        Write-Host "  Creating database and firewall rules..." -ForegroundColor Gray
        
        # Create database
        az postgres flexible-server db create `
            --server-name weeklyplanner-db `
            --resource-group weeklyplanner-rg `
            --database-name weeklyplanner_prod 2>&1 | Out-Null
        Write-Host "  ✓ Database created" -ForegroundColor Green
        
        # Configure firewall
        az postgres flexible-server firewall-rule create `
            --server-name weeklyplanner-db `
            --resource-group weeklyplanner-rg `
            --rule-name AllowAzureServices `
            --start-ip-address 0.0.0.0 `
            --end-ip-address 0.0.0.0 2>&1 | Out-Null
        Write-Host "  ✓ Firewall configured" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⏳ PostgreSQL server still being provisioned..." -ForegroundColor Yellow
}
Write-Host ""

# Check App Service Status
Write-Host "App Service Status:" -ForegroundColor Cyan
try {
    $appStatus = az webapp show --name weeklyplanner-api-12345 --resource-group weeklyplanner-rg 2>&1
    if ($appStatus -match "weeklyplanner-api-12345") {
        Write-Host "  ✓ App Service running" -ForegroundColor Green
        Write-Host "  URL: https://weeklyplanner-api-12345.azurewebsites.net" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ App Service check failed" -ForegroundColor Red
}
Write-Host ""

# Check GitHub Workflow Status
Write-Host "GitHub Actions Status:" -ForegroundColor Cyan
try {
    Write-Host "  View workflow runs at:" -ForegroundColor Gray
    Write-Host "  https://github.com/yashhhYB/weekly-planerz/actions" -ForegroundColor Yellow
} catch {
    Write-Host "  Unable to fetch workflow status" -ForegroundColor Yellow
}
Write-Host ""

# Next Steps
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. If PostgreSQL is still creating, wait 2-5 more minutes and re-run this script" -ForegroundColor White
Write-Host "  2. GitHub Actions should start deploying once PostgreSQL setup completes" -ForegroundColor White
Write-Host "  3. View full deployment logs:" -ForegroundColor White
Write-Host "     https://github.com/yashhhYB/weekly-planerz/actions" -ForegroundColor Yellow
Write-Host ""
