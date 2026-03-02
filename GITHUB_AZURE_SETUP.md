# 🚀 GITHUB & AZURE SETUP GUIDE

## ✅ LOCAL GIT STATUS (VERIFIED)

Your local repository is ready:
```
✅ main branch: Created with full codebase (59 files)
✅ dev branch: Created and synced with main
✅ .gitattributes: Configured for proper line endings
✅ Initial commit: Contains all Day 1 foundation
```

**Commit Hash:** `3995e6c`  
**Status:** Ready for GitHub push

---

## 📋 STEP 1: CREATE GITHUB REPOSITORY

### Option A: Using GitHub Web UI (Easiest)

1. Go to: https://github.com/yashhhYB
2. Click **"New"** button (top left, green)
3. Fill in:
   - **Repository name:** `weekly-planner`
   - **Description:** `Production-grade Weekly Planning System (ASP.NET Core 8 + Angular 17)`
   - **Visibility:** `Private` (or Public if you prefer)
   - **Initialize:** Leave unchecked (we have local repo)
4. Click **"Create repository"**

### Option B: Using GitHub CLI

```powershell
# Install GitHub CLI if you haven't: https://cli.github.com/
gh repo create weekly-planner --private --source=. --remote=origin --push
```

---

## 🔗 STEP 2: CONNECT LOCAL REPO TO GITHUB

After creating the repository on GitHub, you'll see commands like:

```bash
git remote add origin https://github.com/yashhhYB/weekly-planner.git
git branch -M main
git push -u origin main
```

**Run these exact commands:**

```powershell
cd d:\Time-Management2

# Add GitHub as remote
git remote add origin https://github.com/yashhhYB/weekly-planner.git

# Ensure we're on main
git branch -M main

# Push main branch
git push -u origin main

# Push dev branch
git push -u origin dev

# Verify
git remote -v
git branch -a
```

---

## 📤 STEP 3: VERIFY PUSH TO GITHUB

After running the commands above:

```powershell
# Check remote
git remote -v
# Should show:
# origin  https://github.com/yashhhYB/weekly-planner.git (fetch)
# origin  https://github.com/yashhhYB/weekly-planner.git (push)

# Check branches
git branch -a
# Should show:
# * main
#   dev
#   remotes/origin/HEAD -> origin/main
#   remotes/origin/main
#   remotes/origin/dev
```

Go to https://github.com/yashhhYB/weekly-planner and verify:
- ✅ **main** branch has 59 files
- ✅ **dev** branch exists and synced
- ✅ Commit message shows "build: Initialize production-grade Weekly Planner..."

---

## 🔐 STEP 4: CONFIGURE GITHUB SECRETS (FOR CI/CD)

GitHub Actions needs secrets to deploy to Azure. Follow these steps:

### 4a. Get Backend Publish Profile

**In Azure Portal:**
1. Go to your App Service (backend)
2. Click **"Download Publishing Profile"** (top right)
3. This downloads a `.xml` file

### 4b. Get Static Web App Token

**In Azure Portal:**
1. Go to your Static Web App (frontend)
2. Click **"Manage deployment token"**
3. Copy the token

### 4c. Add Secrets to GitHub

1. Go to: `https://github.com/yashhhYB/weekly-planner/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these 3 secrets:

| Secret Name | Value | From |
|------------|-------|------|
| `AZURE_BACKEND_APP_NAME` | `your-backend-app` | Azure App Service name |
| `AZURE_BACKEND_PUBLISH_PROFILE` | (paste entire .xml content) | Downloaded publish profile |
| `AZURE_STATIC_WEB_APP_TOKEN` | (paste token) | Static Web App token |

**Example command for Windows (copy .xml content):**
```powershell
# Open the xml in notepad, copy all content
notepad "D:\Path\To\publish-profile.xml"
# Copy all text → paste into GitHub secret
```

---

## 🏗️ STEP 5: CREATE AZURE RESOURCES (IF NOT DONE)

### Skip this if you already have Azure resources set up!

**If you need to create them:**

```powershell
# Make sure you have Azure CLI installed
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows

# Login to Azure
az login

# Create Resource Group
az group create --name weekly-planner-rg --location eastus

# Create App Service Plan (Backend)
az appservice plan create `
  --name weekly-planner-plan `
  --resource-group weekly-planner-rg `
  --sku B1 --is-linux

# Create App Service (Backend .NET)
az webapp create `
  --resource-group weekly-planner-rg `
  --plan weekly-planner-plan `
  --name weeklyplanner-api-prod `
  --runtime "DOTNET:8"

# Create Azure PostgreSQL Server
az postgres server create `
  --name weeklyplanner-db-prod `
  --resource-group weekly-planner-rg `
  --location eastus `
  --admin-user planner_admin `
  --admin-password "WeeklyPlanner@123Main" `
  --sku-name B_Gen5_1 `
  --ssl-enforcement

# Create Static Web App (Frontend)
# Note: Static Web App requires creation via Portal or special extension
# Go to: https://portal.azure.com
# Search "Static Web Apps" → Create
# Select your GitHub repo as source
```

---

## 🔄 STEP 6: CONFIGURE CI/CD ENVIRONMENTS (GitHub)

For the deployment workflow to work, create GitHub environment:

1. Go to: `https://github.com/yashhhYB/weekly-planner/settings/environments`
2. Click **"New environment"**
3. Name: **`production`**
4. Add the same 3 secrets there (they'll inherit if not specified)

---

## 🧪 STEP 7: VERIFY CI/CD PIPELINE

After push, CI/CD automatically runs:

1. Go to: `https://github.com/yashhhYB/weekly-planner/actions`
2. You should see workflows running:
   - ✅ Backend CI (if you pushed backend/* changes)
   - ✅ Frontend CI (if you pushed frontend/* changes)

**Important:** If using **dev branch** for development:
- CI runs, but **doesn't deploy** (deploy only on main)
- Use for testing features
- Create PR to main for deployment

---

## 📊 BRANCH STRATEGY

### Development Workflow

```
dev branch
├── For active feature development
├── All tests run
├── CI pipeline validates
└── NO auto-deploy

main branch
├── Production-ready code
├── All tests pass (100% coverage required)
├── CI pipeline validates
└── AUTO-DEPLOY to Azure
```

### Recommended Git Workflow

```powershell
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/add-dashboard

# 2. Make changes, commit, push
git add .
git commit -m "feat: Add dashboard page with aggregated metrics"
git push origin feature/add-dashboard

# 3. Create Pull Request on GitHub
# From: feature/add-dashboard → To: dev

# 4. After PR approval, merge to dev
# Branch auto-deletes

# 5. When ready for production
# Create PR from dev → main
# After approval, merge to main
# GitHub Actions auto-deploys to Azure
```

---

## 🚨 REQUIRED: 100% CODE COVERAGE

⚠️ **CRITICAL:** Backend CI workflow REQUIRES 100% coverage.

```yaml
# From: .github/workflows/backend-ci.yml
/p:Threshold=100
/p:ThresholdStat=total
```

**If coverage < 100%:**
- ❌ Build FAILS
- ❌ Merge blocked to main
- ✅ Deploy skipped

**Example:**
```powershell
cd backend

# Check coverage before commit
dotnet test /p:CollectCoverage=true /p:Threshold=100

# If fails
# → Open coverage.cobertura.xml
# → Add tests for uncovered lines
# → Re-run until 100%
```

---

## 📝 CONVENTIONAL COMMITS

Use these commit types for consistent history:

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting only
refactor: Code restructuring
test:     Tests only
chore:    Build, dependencies
ci:       CI/CD changes
perf:     Performance improvement
```

**Examples:**
```
feat(domain): Add PlanEntry entity with validation
fix(api): Resolve Tuesday validation error
docs(setup): Add Azure deployment guide
test(domain): Add 30+ unit tests for plan validation
```

---

## 🔍 GITHUB STATUS CHECKS

After each push:

1. ✅ **backend-ci.yml** checks:
   - Code builds
   - All tests pass
   - Coverage = 100%
   - StyleCop passes

2. ✅ **frontend-ci.yml** checks:
   - Dependencies install
   - Linting passes
   - Tests pass
   - Build succeeds

3. ✅ **deploy.yml** (main only):
   - Backend publishes
   - Deploys to Azure App Service
   - Frontend builds
   - Deploys to Azure Static Web App

---

## 🏥 TROUBLESHOOTING

### "Authentication failed for GitHub"

```powershell
# Setup credential helper
git config --global credential.helper wincred
# or
git config --global credential.helper manager-core
```

### "Protected branch blocks merge"

If main is protected:
1. Go to: `https://github.com/yashhhYB/weekly-planner/settings/branches`
2. Review branch protection rules
3. Adjust if needed (or use for safety)

### "CI fails on 100% coverage"

```powershell
cd backend

# See which lines not covered
dotnet test /p:CollectCoverage=true
# Open: coverage.cobertura.xml

# Add tests to reach 100%
# Test file locations: tests/WeeklyPlanner.UnitTests/Domain/
```

### "Cannot push to origin"

```powershell
# Verify remote
git remote -v

# Update if needed
git remote set-url origin https://github.com/yashhhYB/weekly-planner.git

# Try push again
git push -u origin main
```

---

## ✅ FINAL CHECKLIST

Before you start Day 2 development:

- [ ] GitHub repo created at yashhhYB/weekly-planner
- [ ] main branch has 59 files (visible on GitHub)
- [ ] dev branch exists (visible on GitHub)
- [ ] Can push/pull without authentication prompts
- [ ] GitHub Actions tab shows workflows configured
- [ ] Backend CI workflow ready (blue checkmark in Actions)
- [ ] Frontend CI workflow ready (blue checkmark in Actions)
- [ ] Deploy workflow ready (will trigger on main push)
- [ ] Azure App Service created (backend)
- [ ] Azure Static Web App created (frontend)
- [ ] Azure PostgreSQL created (database)
- [ ] GitHub secrets added (3 secrets)
- [ ] Can run `dotnet test` locally (100% coverage)
- [ ] Can run `npm install && npm start` locally

---

## 🎯 NEXT: START DAY 2 DEVELOPMENT

Once GitHub is set up, you're ready to:

```powershell
# 1. Checkout dev for development
git checkout dev

# 2. Create feature branch
git checkout -b feature/complete-domain-entities

# 3. Implement features, add tests
# Make commits as you work

# 4. Push to GitHub
git push origin feature/complete-domain-entities

# 5. Create PR to dev for review
# Automated CI checks run

# 6. After review, merge to dev
# 7. After stability, PR dev → main
# 8. Merge to main → Auto-deploy to Azure!
```

---

## 📞 QUICK LINKS

| Resource | URL |
|----------|-----|
| Your Repository | https://github.com/yashhhYB/weekly-planner |
| GitHub Secrets | https://github.com/yashhhYB/weekly-planner/settings/secrets/actions |
| GitHub Actions | https://github.com/yashhhYB/weekly-planner/actions |
| Azure Portal | https://portal.azure.com |
| Local Setup | Read: `SETUP_GUIDE.md` |
| API Contract | Read: `docs/api-contract.md` |

---

**Generated:** March 2, 2026  
**Status:** Ready for GitHub Push ✅  
**Next Step:** Follow STEP 1-3 above to push to GitHub
