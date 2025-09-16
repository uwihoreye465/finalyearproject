# Script to create test data for FindSinnerSystem
# Run this after your server is running on port 6000

Write-Host "🚀 Creating Test Data for FindSinnerSystem..." -ForegroundColor Green
Write-Host "=" * 50

$baseUrl = "http://localhost:6000/api/v1"

# Step 1: Create admin user if doesn't exist
Write-Host "`n👤 Creating Admin User..." -ForegroundColor Yellow
try {
    $adminData = @{
        email = "admin@test.com"
        password = "admin123"
        fullname = "Test Admin"
        role = "admin"
    }
    
    $adminBody = $adminData | ConvertTo-Json
    $createAdminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/create-first-admin" -Method POST -Body $adminBody -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "✅ Admin user created or already exists" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Admin user might already exist, continuing..." -ForegroundColor Yellow
}

# Step 2: Login with admin
Write-Host "`n🔐 Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@test.com"
        password = "admin123"
    }
    
    $loginBody = $loginData | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.token
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.data.user.fullname)" -ForegroundColor Cyan
        Write-Host "   Role: $($loginResponse.data.user.role)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
        
        # Try with the email from .env file
        Write-Host "🔄 Trying with email from .env file..." -ForegroundColor Yellow
        $loginData.email = "uwihoreyefrancois12@gmail.com"
        $loginBody = $loginData | ConvertTo-Json
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        
        if ($loginResponse.success) {
            $token = $loginResponse.data.token
            Write-Host "✅ Login successful with .env email" -ForegroundColor Green
        } else {
            Write-Host "❌ Login failed with both emails" -ForegroundColor Red
            exit
        }
    }
} catch {
    Write-Host "❌ Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 3: Create test arrest records
Write-Host "`n📝 Creating Test Arrest Records..." -ForegroundColor Yellow

$headers = @{ Authorization = "Bearer $token" }

$testArrests = @(
    @{
        fullname = "Test Criminal 1"
        crime_type = "Theft"
        arrest_location = "Kigali City Center"
        id_type = "indangamuntu_yumunyarwanda"
        id_number = "1199012345678901"
    },
    @{
        fullname = "Test Criminal 2"
        crime_type = "Assault"
        arrest_location = "Nyamirambo Market"
        id_type = "indangamuntu_yumunyarwanda"
        id_number = "1199012345678902"
    },
    @{
        fullname = "Test Criminal 3"
        crime_type = "Drug Trafficking"
        arrest_location = "Remera Taxi Station"
        id_type = "passport"
        id_number = "P123456789"
    },
    @{
        fullname = "Jane Doe Mukamana"
        crime_type = "Fraud"
        arrest_location = "Kimisagara"
        id_type = "indangamuntu_yumunyarwanda"
        id_number = "1199012345678903"
    },
    @{
        fullname = "John Smith Uwimana"
        crime_type = "Burglary"
        arrest_location = "Gikondo"
        id_type = "indangamuntu_yumunyarwanda"
        id_number = "1199012345678904"
    }
)

$createdRecords = @()

foreach ($arrest in $testArrests) {
    try {
        $arrestBody = $arrest | ConvertTo-Json
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/arrested" -Method POST -Body $arrestBody -ContentType "application/json" -Headers $headers
        
        if ($createResponse.success) {
            $createdRecords += $createResponse.data
            Write-Host "✅ Created: $($arrest.fullname) - $($arrest.crime_type)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create: $($arrest.fullname)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error creating $($arrest.fullname): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500  # Small delay between requests
}

# Step 4: Test the API endpoints
Write-Host "`n🧪 Testing API Endpoints..." -ForegroundColor Yellow

# Test GET all records
try {
    $allRecords = Invoke-RestMethod -Uri "$baseUrl/arrested" -Method GET -Headers $headers
    Write-Host "✅ GET All Records: Found $($allRecords.data.pagination.total) total records" -ForegroundColor Green
} catch {
    Write-Host "❌ GET All Records failed" -ForegroundColor Red
}

# Test Statistics
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/arrested/statistics" -Method GET -Headers $headers
    Write-Host "✅ Statistics: $($stats.data.totalArrests) total arrests, $($stats.data.thisMonthArrests) this month" -ForegroundColor Green
} catch {
    Write-Host "❌ Statistics failed" -ForegroundColor Red
}

# Test Search
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/arrested?search=theft" -Method GET -Headers $headers
    Write-Host "✅ Search 'theft': Found $($searchResults.data.records.Count) records" -ForegroundColor Green
} catch {
    Write-Host "❌ Search failed" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "🎉 Test Data Creation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   - Created $($createdRecords.Count) arrest records" -ForegroundColor White
Write-Host "   - Admin token: $($token.Substring(0, 20))..." -ForegroundColor White
Write-Host ""
Write-Host "For Postman Testing:" -ForegroundColor Cyan
Write-Host "   1. Use POST $baseUrl/arrested" -ForegroundColor White
Write-Host "   2. Add Authorization header: Bearer TOKEN" -ForegroundColor White
Write-Host "   3. Use this body format:" -ForegroundColor White
Write-Host "   {" -ForegroundColor Gray
Write-Host "     fullname: Your Criminal Name," -ForegroundColor Gray
Write-Host "     crime_type: Your Crime Type," -ForegroundColor Gray
Write-Host "     arrest_location: Location," -ForegroundColor Gray
Write-Host "     id_type: indangamuntu_yumunyarwanda," -ForegroundColor Gray
Write-Host "     id_number: 1199012345678999" -ForegroundColor Gray
Write-Host "   }" -ForegroundColor Gray
Write-Host ""
Write-Host "DO NOT include: arrest_id, criminal_record_id, arresting_officer_id, created_at, updated_at" -ForegroundColor Yellow
