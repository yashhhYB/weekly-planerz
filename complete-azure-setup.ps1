# Weekly Planner - Complete Azure Setup Script
# This script completes the Azure infrastructure and GitHub configuration

Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Weekly Planner Azure + GitHub Setup                            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Verify we're in the correct directory
if (-not (Test-Path ".github/workflows/deploy.yml")) {
    Write-Host "ERROR: Must run from repository root directory" -ForegroundColor Red
    exit 1
}

# Configuration
$ResourceGroup = "weeklyplanner-rg"
$AppServiceName = "weeklyplanner-api-12345"
$Location = "centralindia"
$PostgresServerName = "weeklyplanner-db"
$DatabaseName = "weeklyplanner_prod"
$DbAdminUser = "dbadmin"
$DbAdminPassword = "WeeklyPlanner@123"
$GitHubRepo = "yashhhYB/weekly-planerz"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  App Service: $AppServiceName"
Write-Host "  PostgreSQL: $PostgresServerName"
Write-Host "  Location: $Location"
Write-Host ""

# Step 1: Register PostgreSQL Provider
Write-Host "Step 1: Registering PostgreSQL provider..." -ForegroundColor Yellow
try {
    az provider register --namespace Microsoft.DBforPostgreSQL 2>&1 | Out-Null
    Write-Host "  ✓ Provider registration initiated" -ForegroundColor Green
    Write-Host "  (This typically completes within 2-3 minutes)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Waiting 30 seconds for registration..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
} catch {
    Write-Host "  ✗ Provider registration failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create PostgreSQL Server
Write-Host "Step 2: Creating PostgreSQL Flexible Server..." -ForegroundColor Yellow
try {
    Write-Host "  This may take 5-10 minutes..." -ForegroundColor Gray
    $pgResult = az postgres flexible-server create `
        --name $PostgresServerName `
        --resource-group $ResourceGroup `
        --location $Location `
        --admin-user $DbAdminUser `
        --admin-password $DbAdminPassword `
        --sku-name Standard_B1ms `
        --tier Burstable `
        --yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ PostgreSQL server created successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ PostgreSQL creation failed" -ForegroundColor Red
        Write-Host "  Output: $pgResult" -ForegroundColor Red
        Write-Host "  (You can retry Step 2-4 separately if needed)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ PostgreSQL creation error" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 3: Create Database
Write-Host "Step 3: Creating PostgreSQL database..." -ForegroundColor Yellow
try {
    az postgres flexible-server db create `
        --server-name $PostgresServerName `
        --resource-group $ResourceGroup `
        --database-name $DatabaseName 2>&1 | Out-Null
    Write-Host "  ✓ Database created successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Database creation failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 4: Configure Firewall
Write-Host "Step 4: Configuring firewall rules..." -ForegroundColor Yellow
try {
    az postgres flexible-server firewall-rule create `
        --server-name $PostgresServerName `
        --resource-group $ResourceGroup `
        --rule-name AllowAzureServices `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0 2>&1 | Out-Null
    Write-Host "  ✓ Firewall rule created" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Firewall configuration failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 5: Configure App Service Connection String
Write-Host "Step 5: Configuring App Service connection string..." -ForegroundColor Yellow
try {
    $connectionString = "Host=$PostgresServerName.postgres.database.azure.com;Port=5432;Database=$DatabaseName;Username=$DbAdminUser@$PostgresServerName;Password=$DbAdminPassword;SSL Mode=Require;"
    
    az webapp config connection-string set `
        --name $AppServiceName `
        --resource-group $ResourceGroup `
        --settings DefaultConnection="Data Source=tcp:$PostgresServerName.postgres.database.azure.com,1433;Initial Catalog=$DatabaseName;User ID=$DbAdminUser@$PostgresServerName;Password=$DbAdminPassword;Trusted_Connection=False;Encrypt=True;" 2>&1 | Out-Null
    
    Write-Host "  ✓ Connection string configured" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Connection string configuration failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 6: Configure GitHub Secrets
Write-Host "Step 6: Configuring GitHub secrets..." -ForegroundColor Yellow

# Get Publish Profile
Write-Host "  Retrieving publish profile..." -ForegroundColor Gray
try {
    if (Test-Path "publish-profile.xml") {
        $publishProfile = Get-Content "publish-profile.xml" -Raw
    } else {
        $publishProfile = az webapp deployment list-publishing-profiles `
            --resource-group $ResourceGroup `
            --name $AppServiceName `
            --xml 2>&1
    }
    
    gh secret set AZURE_BACKEND_PUBLISH_PROFILE --body "$publishProfile" -R $GitHubRepo 2>&1 | Out-Null
    Write-Host "  ✓ AZURE_BACKEND_PUBLISH_PROFILE secret created" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to set publish profile secret" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

# Set App Service Name Secret
Write-Host "  Setting app service name..." -ForegroundColor Gray
try {
    gh secret set AZURE_BACKEND_APP_NAME --body "$AppServiceName" -R $GitHubRepo 2>&1 | Out-Null
    Write-Host "  ✓ AZURE_BACKEND_APP_NAME secret created" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to set app service name secret" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 7: Commit and Push Changes
Write-Host "Step 7: Committing changes to GitHub..." -ForegroundColor Yellow
try {
    git add deploy.yml
    git commit -m "chore: Update deploy.yml with correct app service name (weeklyplanner-api-12345, centralindia region)" 2>&1 | Out-Null
    git push origin main 2>&1 | Out-Null
    Write-Host "  ✓ Changes pushed to GitHub" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Git commit/push failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 8: Monitor Deployment
Write-Host "Step 8: GitHub Actions Deployment" -ForegroundColor Yellow
Write-Host "  Monitoring deployment workflow..." -ForegroundColor Gray
Write-Host ""
Write-Host "  View deployment status at:" -ForegroundColor Cyan
Write-Host "  https://github.com/$GitHubRepo/actions" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete!                                               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to GitHub Actions: https://github.com/$GitHubRepo/actions" -ForegroundColor White
Write-Host "  2. Monitor the deployment workflow" -ForegroundColor White
Write-Host "  3. Application will be available at:" -ForegroundColor White
Write-Host "     https://$AppServiceName.azurewebsites.net/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Important Endpoints:" -ForegroundColor Cyan
Write-Host "  API Health:  https://$AppServiceName.azurewebsites.net/health" -ForegroundColor Yellow
Write-Host "  API Swagger: https://$AppServiceName.azurewebsites.net/swagger" -ForegroundColor Yellow
Write-Host ""
Write-Host "Database Info:" -ForegroundColor Cyan
Write-Host "  Server: $PostgresServerName.postgres.database.azure.com" -ForegroundColor Yellow
Write-Host "  Database: $DatabaseName" -ForegroundColor Yellow
Write-Host "  User: $DbAdminUser@$PostgresServerName" -ForegroundColor Yellow
Write-Host ""
