# Free Tier Deployment Guide

## ✅ What's Ready

### Frontend - Azure Static Web Apps (FREE)
- **Status:** ✅ Created successfully
- **Location:** West Europe
- **URL:** https://orange-meadow-0bc016403.4.azurestaticapps.net
- **Cost:** Free (up to 100 GB/month bandwidth)
- **Build:** `d:\Time-Management2\frontend\dist\` ready

### Backend Database - Azure PostgreSQL
- **Status:** ✅ Running (weeklyplanner-db-prod)
- **Location:** North Europe
- **Cost:** ~$25/month (cheapest paid option)
- **Connection:** Already configured, migrations applied

---

## 🚀 OPTION 1: LOCAL BACKEND + STATIC FRONTEND (RECOMMENDED - $25/month)

### Step 1: Deploy Frontend to Static Web Apps

```powershell
cd "d:\Time-Management2\frontend"

# Build for production
ng build --configuration production

# Deploy to Static Web Apps
az staticwebapp backends create --resource-group weekly-planner-rg `
  --name weeklyplanner-web `
  --backend-resource-id "/subscriptions/c20e62ae-20c1-48a0-b194-b4c373d55af8/resourceGroups/weekly-planner-rg/providers/Microsoft.Web/sites/weeklyplanner-api" `
  --backend-auth "identityProvider"
```

### Step 2: Get Static Web Apps Deployment Token

```powershell
# Get deployment token for Static Web Apps
$token = az staticwebapp secrets list --name weeklyplanner-web `
  --resource-group weekly-planner-rg --query "properties.apiKey" -o tsv

Write-Host "Deployment Token: $token"
```

### Step 3: Deploy Frontend

```powershell
cd "d:\Time-Management2\frontend"

# Install deployment tool
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist --deployment-token $token
```

### Step 4: Run Backend Locally with Azure Database

```powershell
# Terminal 1: Backend with Production Environment
cd "d:\Time-Management2\backend\src\WeeklyPlanner.API"
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

Backend will be available at: `http://localhost:5000` (or configured port)

### Step 5: Update Frontend to Call Backend

Edit `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api'
};
```

**Total Cost:** ~$25/month (PostgreSQL only)  
**Deployment Time:** ~10 minutes  
**Best For:** Testing before production deployment

---

## 🐳 OPTION 2: AZURE CONTAINER INSTANCES (CHEAP - $5-10/month)

### Prerequisites
- Install Docker Desktop
- Azure Container Registry (free tier available)

### Step 1: Create Docker Image

```powershell
cd "d:\Time-Management2\backend"

# Create Dockerfile
@'
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/WeeklyPlanner.API/WeeklyPlanner.API.csproj", "src/WeeklyPlanner.API/"]
COPY ["src/WeeklyPlanner.Application/WeeklyPlanner.Application.csproj", "src/WeeklyPlanner.Application/"]
COPY ["src/WeeklyPlanner.Domain/WeeklyPlanner.Domain.csproj", "src/WeeklyPlanner.Domain/"]
COPY ["src/WeeklyPlanner.Infrastructure/WeeklyPlanner.Infrastructure.csproj", "src/WeeklyPlanner.Infrastructure/"]

RUN dotnet restore "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj"
COPY . .
RUN dotnet build "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/publish

FROM runtime AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "WeeklyPlanner.API.dll"]
'@ | Out-File -FilePath Dockerfile -Encoding UTF8

# Build image
docker build -t weeklyplanner-api:latest .

# Tag for registry
docker tag weeklyplanner-api:latest weeklyplanner.azurecr.io/weeklyplanner-api:latest
```

### Step 2: Create Container Registry

```powershell
az acr create --resource-group weekly-planner-rg `
  --name weeklyplanner `
  --sku Basic
```

### Step 3: Deploy Container

```powershell
# Push to registry
docker push weeklyplanner.azurecr.io/weeklyplanner-api:latest

# Deploy to Container Instances
az container create --resource-group weekly-planner-rg `
  --name weeklyplanner-api-container `
  --image weeklyplanner.azurecr.io/weeklyplanner-api:latest `
  --cpu 1 --memory 1 `
  --registry-login-server weeklyplanner.azurecr.io `
  --registry-username $(az acr credential show -n weeklyplanner --query username -o tsv) `
  --registry-password $(az acr credential show -n weeklyplanner --query "passwords[0].value" -o tsv) `
  --environment-variables ASPNETCORE_ENVIRONMENT="Production" `
  --ports 5000 `
  --dns-name-label weeklyplanner-api
```

**Backend URL:** `http://weeklyplanner-api.westeurope.azurecontainer.io:5000`

**Total Cost:** ~$5-10/month (Container Instance usage)  
**Deployment Time:** ~20 minutes  
**Best For:** Production deployment without App Service quota

---

## 💰 COST COMPARISON

| Option | Frontend | Backend | Database | Total/Month | Quota Needed |
|--------|----------|---------|----------|-------------|--------------|
| **Local Backend** | Static (Free) | Local | PostgreSQL | ~$25 | None |
| **Container Instance** | Static (Free) | ACI | PostgreSQL | ~$30-35 | None |
| **App Service (after quota)** | Static (Free) | App Service B1 | PostgreSQL | ~$50-60 | 1 Basic VM |

---

## 📋 CURRENT SETUP STATUS

✅ **Completed:**
- Frontend build: `dist/` production bundle ready
- Backend build: Release build optimized
- Database: PostgreSQL 16 running, migrations applied
- Static Web Apps: Created and ready

⏳ **Next Steps:**
1. Choose Option 1 (Local) or Option 2 (Containers)
2. Follow the deployment steps above
3. Test the full-stack application
4. (Optional) Wait for App Service quota approval for permanent deployment

---

## 🔗 QUICK REFERENCE COMMANDS

**Option 1 - Deploy Frontend Only:**
```powershell
cd "d:\Time-Management2\frontend"
ng build --configuration production
```

**Option 1 - Run Backend Locally:**
```powershell
cd "d:\Time-Management2\backend\src\WeeklyPlanner.API"
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

**Check Static Web Apps Status:**
```powershell
az staticwebapp show --name weeklyplanner-web --resource-group weekly-planner-rg
```

**Check PostgreSQL Connection:**
```powershell
az postgres flexible-server show --name weeklyplanner-db-prod --resource-group weekly-planner-rg
```

---

## 📞 SUPPORT

**If Option 1 (Local Backend) fails:**
- Check PostgreSQL firewall: `az postgres flexible-server firewall-rule create`
- Verify connection string in `appsettings.Production.json`
- Run migrations: `dotnet ef database update`

**If Static Web Apps deployment fails:**
- Check build output in `frontend/dist/`
- Verify Angular production build succeeds locally
- Check Static Web Apps portal logs

