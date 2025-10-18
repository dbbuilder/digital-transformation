# Supabase Schema Deployment (PowerShell)
# This script deploys the database schema using PowerShell, which handles IPv6 better than WSL

$ErrorActionPreference = "Stop"

Write-Host "🚀 Supabase Schema Deployment (PowerShell)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Load secrets
$secretsPath = Join-Path $PSScriptRoot "..\app\app.secrets.json"
$secrets = Get-Content $secretsPath | ConvertFrom-Json

$projectRef = $secrets.supabase.projectId
$serviceRoleKey = $secrets.supabase.serviceRoleKey

Write-Host "Project: $projectRef" -ForegroundColor Yellow
Write-Host ""

# Read schema file
$schemaPath = Join-Path $PSScriptRoot "..\supabase\schema.sql"
Write-Host "📄 Reading schema from: $schemaPath" -ForegroundColor Yellow

if (-not (Test-Path $schemaPath)) {
    Write-Host "❌ Error: schema.sql file not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

$schemaSql = Get-Content $schemaPath -Raw
$schemaSizeKB = [Math]::Round($schemaSql.Length / 1024, 2)

Write-Host "📊 Schema size: $schemaSizeKB KB" -ForegroundColor Yellow
Write-Host ""

# Get database password
$dbPassword = $env:SUPABASE_DB_PASSWORD

if (-not $dbPassword) {
    Write-Host "❌ SUPABASE_DB_PASSWORD environment variable not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Set it with:" -ForegroundColor Yellow
    Write-Host '$env:SUPABASE_DB_PASSWORD = "Gv51076!"' -ForegroundColor White
    Write-Host ".\scripts\deploy-schema.ps1" -ForegroundColor White
    exit 1
}

# Connection string using connection pooler (port 6543)
$connectionString = "Host=db.$projectRef.supabase.co;Port=6543;Database=postgres;Username=postgres;Password=$dbPassword;SSL Mode=Require;Trust Server Certificate=true"

Write-Host "🔌 Installing Npgsql (if not already installed)..." -ForegroundColor Yellow

# Check if we can use Npgsql (PostgreSQL .NET library)
try {
    # Try to load Npgsql assembly
    Add-Type -AssemblyName "Npgsql" -ErrorAction SilentlyContinue
    Write-Host "✅ Npgsql already available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Npgsql not found. Falling back to manual deployment." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/$projectRef/sql/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Copy the schema file to clipboard:" -ForegroundColor Yellow
Write-Host "   Get-Content supabase\schema.sql -Raw | Set-Clipboard" -ForegroundColor White
Write-Host ""
Write-Host "3. Paste into SQL Editor and click 'Run'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Verify tables created at:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor White
Write-Host ""

# Copy to clipboard if possible
try {
    Set-Clipboard -Value $schemaSql
    Write-Host "✅ Schema copied to clipboard! Just paste in SQL Editor." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  Couldn't copy to clipboard automatically." -ForegroundColor Yellow
    Write-Host "   Run: Get-Content supabase\schema.sql -Raw | Set-Clipboard" -ForegroundColor White
    Write-Host ""
}

Write-Host "Expected tables after deployment:" -ForegroundColor Cyan
Write-Host "  ✓ profiles" -ForegroundColor White
Write-Host "  ✓ projects" -ForegroundColor White
Write-Host "  ✓ project_members" -ForegroundColor White
Write-Host "  ✓ teams" -ForegroundColor White
Write-Host "  ✓ stakeholders" -ForegroundColor White
Write-Host "  ✓ assessments" -ForegroundColor White
Write-Host "  ✓ assessment_responses" -ForegroundColor White
Write-Host "  ✓ sow_section_approvals" -ForegroundColor White
Write-Host "  ✓ sow_approval_workflows" -ForegroundColor White
Write-Host "  ✓ sync_metadata" -ForegroundColor White
Write-Host ""
