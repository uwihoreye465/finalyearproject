Write-Host "Testing FindSinnerSystem API..." -ForegroundColor Green

$baseUrl = "http://localhost:6000/api/v1"

# Test 1: Get example format
Write-Host "Getting example request format..." -ForegroundColor Yellow
try {
    $example = Invoke-RestMethod -Uri "$baseUrl/test-arrested/example" -Method GET
    Write-Host "Example endpoint works!" -ForegroundColor Green
    Write-Host "Required fields:" -ForegroundColor Cyan
    Write-Host "- fullname (required)" -ForegroundColor White
    Write-Host "- crime_type (required)" -ForegroundColor White
    Write-Host "- date_arrested (optional)" -ForegroundColor White
    Write-Host "- arrest_location (optional)" -ForegroundColor White
    Write-Host "- id_type (optional)" -ForegroundColor White
    Write-Host "- id_number (optional)" -ForegroundColor White
} catch {
    Write-Host "Example endpoint failed" -ForegroundColor Red
}

# Test 2: Try to login
Write-Host "`nTesting login..." -ForegroundColor Yellow
$loginData = @{
    email = "uwihoreyefrancois12@gmail.com"
    password = "password123"
}

try {
    $loginBody = $loginData | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.token
        Write-Host "Login successful!" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Cyan
        
        # Test 3: Create arrest record with minimal data
        Write-Host "`nTesting arrest creation..." -ForegroundColor Yellow
        $arrestData = @{
            fullname = "Simple Test Criminal"
            crime_type = "Test Crime"
        }
        
        $arrestBody = $arrestData | ConvertTo-Json
        $headers = @{ Authorization = "Bearer $token" }
        
        try {
            $createResponse = Invoke-RestMethod -Uri "$baseUrl/arrested" -Method POST -Body $arrestBody -ContentType "application/json" -Headers $headers
            
            if ($createResponse.success) {
                Write-Host "Arrest record created successfully!" -ForegroundColor Green
                Write-Host "ID: $($createResponse.data.arrest_id)" -ForegroundColor Cyan
                Write-Host "Name: $($createResponse.data.fullname)" -ForegroundColor Cyan
                Write-Host "Crime: $($createResponse.data.crime_type)" -ForegroundColor Cyan
                Write-Host "Officer ID: $($createResponse.data.arresting_officer_id)" -ForegroundColor Cyan
            } else {
                Write-Host "Failed: $($createResponse.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "Create arrest failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Login error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFor Postman, use this exact format:" -ForegroundColor Yellow
Write-Host "POST $baseUrl/arrested" -ForegroundColor White
Write-Host "Headers: Authorization: Bearer YOUR_TOKEN" -ForegroundColor White
Write-Host "Body (JSON):" -ForegroundColor White
Write-Host '{' -ForegroundColor Gray
Write-Host '  "fullname": "Criminal Name",' -ForegroundColor Gray
Write-Host '  "crime_type": "Crime Type"' -ForegroundColor Gray
Write-Host '}' -ForegroundColor Gray
