# Backend API Test Script
$API_URL = "https://samarthdesk-ai-backend.railway.app"

Write-Host "Testing Backend API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$API_URL/health" -Method GET
    Write-Host "✅ Health Check Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login API
Write-Host "`n2. Testing Login Endpoint..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@samarthdesk.com"
    password = "Admin@123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Origin" = "https://samarthdesk-ai-poojarajpurohit684s-projects.vercel.app"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_URL/api/v1/auth/login" -Method POST -Body $loginData -Headers $headers
    Write-Host "✅ Login Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    $responseContent = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Login Response: $($responseContent | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✨ Test Complete!" -ForegroundColor Green