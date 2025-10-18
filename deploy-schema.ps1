# Deploy Supabase Schema from Windows PowerShell
# Run this script from Windows PowerShell (not WSL) due to IPv6 networking requirements

param(
    [string]$ProjectId = "grglttyirzxfdpbyuxut",
    [string]$DbPassword = "#DBBuilder01!"
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Supabase Schema Deployment Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  1. Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "  2. Or use: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ psql found at: $($psqlPath.Source)" -ForegroundColor Green

# Construct connection string
$connectionString = "postgresql://postgres:$DbPassword@db.$ProjectId.supabase.co:5432/postgres?sslmode=require"

# Get schema file path
$schemaPath = Join-Path $PSScriptRoot "supabase\schema.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "ERROR: Schema file not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Schema file found: $schemaPath" -ForegroundColor Green
Write-Host ""

# Test connection first
Write-Host "Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPassword
$testResult = psql "$connectionString" -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to connect to database" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify database password is correct" -ForegroundColor Yellow
    Write-Host "  2. Check firewall/network settings" -ForegroundColor Yellow
    Write-Host "  3. Ensure your IP is not blocked in Supabase dashboard" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use Supabase SQL Editor" -ForegroundColor Cyan
    Write-Host "  https://supabase.com/dashboard/project/$ProjectId/sql/new" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Database connection successful" -ForegroundColor Green
Write-Host ""

# Deploy schema
Write-Host "Deploying schema..." -ForegroundColor Yellow
Write-Host ""

$deployResult = psql "$connectionString" -f "$schemaPath" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "✓ Schema deployed successfully!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify tables in Supabase dashboard:" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/$ProjectId/editor" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Set up authentication:" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/$ProjectId/auth/providers" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Create Supabase access token for GitHub Actions:" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/account/tokens" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "ERROR: Schema deployment failed" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $deployResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check error messages above" -ForegroundColor Yellow
    Write-Host "  2. Verify schema SQL syntax" -ForegroundColor Yellow
    Write-Host "  3. Try deploying via SQL Editor as fallback" -ForegroundColor Yellow
    exit 1
}

# Clean up environment variable
Remove-Item Env:\PGPASSWORD
