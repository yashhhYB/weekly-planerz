# Azure Deployment Script for Weekly Planner
$ErrorActionPreference = "Stop"

$resourceGroup = "weeklyplanner-rg"
$location = "eastus"
$dbServer = "weeklyplanner-db-prod"
$dbName = "weeklyplanner_prod"
$dbAdminUser = "postgres"
$dbPassword = "WeeklyPlanner@SecurePass2024"
$appServicePlan = "weeklyplanner-plan"
$appServiceName = "weeklyplanner-api"
$staticWebAppName = "weeklyplanner-web"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/8] Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azCheck = az --version 2>&1
    Write-Host "✓ Azure CLI ready" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Azure CLI not installed" -ForegroundColor Red
    exit 1
}

Write-Host "[2/8] Checking Azure login..." -ForegroundColor Yellow
try {
    $login = az account show 2>&1 | ConvertFrom-Json
    Write-Host "✓ Logged in to: $($login.name)" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Run az login first" -ForegroundColor Red
    exit 1
}

Write-Host "[3/8] Creating Resource Group: $resourceGroup..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location 2>&1 | Out-Null
Write-Host "✓ Resource Group ready" -ForegroundColor Green

Write-Host "[4/8] Creating PostgreSQL Server - this takes 5-10 minutes..." -ForegroundColor Yellow
Write-Host "      Server: $dbServer" -ForegroundColor Gray
Write-Host "      Location: $location" -ForegroundColor Gray
az postgres flexible-server create `
  --resource-group $resourceGroup `
  --name $dbServer `
  --location $location `
  --admin-user $dbAdminUser `
  --admin-password $dbPassword `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 16 `
  --storage-size 32 `
  --public-access Enabled `
  --yes 2>&1 | Out-Null
Write-Host "✓ PostgreSQL Server created" -ForegroundColor Green
Write-Host "  Waiting 30 seconds for initialization..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host "[5/8] Creating Database: $dbName..." -ForegroundColor Yellow
az postgres flexible-server db create `
  --resource-group $resourceGroup `
  --server-name $dbServer `
  --database-name $dbName 2>&1 | Out-Null
Write-Host "✓ Database created" -ForegroundColor Green

Write-Host "[6/8] Configuring firewall..." -ForegroundColor Yellow
az postgres flexible-server firewall-rule create `
  --resource-group $resourceGroup `
  --name $dbServer `
  --rule-name AllowAllAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0 2>&1 | Out-Null
Write-Host "✓ Firewall rule created" -ForegroundColor Green

Write-Host "[7/8] Creating App Service..." -ForegroundColor Yellow
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku B1 `
  --is-linux 2>&1 | Out-Null
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $appServiceName `
  --runtime "DOTNETCORE|8.0" 2>&1 | Out-Null
Write-Host "✓ App Service created" -ForegroundColor Green

Write-Host "[8/8] Creating Static Web App..." -ForegroundColor Yellow
az staticwebapp create `
  --name $staticWebAppName `
  --resource-group $resourceGroup `
  --location $location `
  --sku Free 2>&1 | Out-Null
Write-Host "✓ Static Web App created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pgServer = az postgres flexible-server show --resource-group $resourceGroup --name $dbServer 2>&1 | ConvertFrom-Json
Write-Host "[PostgreSQL Database]" -ForegroundColor Green
Write-Host "Server: $($pgServer.name)" -ForegroundColor Yellow
Write-Host "FQDN: $($pgServer.fullyQualifiedDomainName)" -ForegroundColor Yellow
Write-Host "Admin: $dbAdminUser" -ForegroundColor Yellow
Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host ""

$connString = "Host=$($pgServer.fullyQualifiedDomainName);Port=5432;Database=$dbName;Username=$dbAdminUser;Password=$dbPassword;SslMode=Require"
Write-Host "[Connection String]" -ForegroundColor Green
Write-Host $connString -ForegroundColor Cyan
Write-Host ""

$appService = az webapp show --resource-group $resourceGroup --name $appServiceName 2>&1 | ConvertFrom-Json
Write-Host "[App Service]" -ForegroundColor Green
Write-Host "URL: https://$($appService.defaultHostName)" -ForegroundColor Cyan
Write-Host ""

$staticApp = az staticwebapp show --resource-group $resourceGroup --name $staticWebAppName 2>&1 | ConvertFrom-Json
Write-Host "[Static Web App]" -ForegroundColor Green
Write-Host "URL: https://$($staticApp.defaultHostName)" -ForegroundColor Cyan
Write-Host ""

$config = @{
    PostgreSQL = @{
        ConnectionString = $connString
    }
    AppService = "https://$($appService.defaultHostName)"
    StaticWebApp = "https://$($staticApp.defaultHostName)"
}

$config | ConvertTo-Json | Out-File azure-deployment-config.json
Write-Host "[OK] Config saved to azure-deployment-config.json" -ForegroundColor Green
