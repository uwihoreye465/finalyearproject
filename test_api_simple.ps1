# Simple PowerShell API Test Script for Arrested Criminals API
# Usage: Run this in PowerShell after your server is running

Write-Host "🚀 Testing FindSinnerSystem Arrested API..." -ForegroundColor Green
Write-Host "=" * 50

# Configuration
$baseUrl = "http://localhost:6000/api/v1"
$credentials = @{
    email = "uwihoreyefrancois12@gmail.com"  # Update if needed
    password = "password123"                  # Update with actual password
}

# Test 1: Health Check
Write-Host "`n🔍 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/../health" -Method GET
    Write-Host "✅ Health Check: $($health.message)" -ForegroundColor Green
    Write-Host "   Timestamp: $($health.timestamp)"
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Authentication
Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Yellow
try {
    $loginBody = $credentials | ConvertTo-Json
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($authResponse.success) {
        $token = $authResponse.data.token
        Write-Host "✅ Authentication Successful" -ForegroundColor Green
        Write-Host "   User: $($authResponse.data.user.fullname)"
        Write-Host "   Role: $($authResponse.data.user.role)"
        Write-Host "   Token: $($token.Substring(0, 20))..."
    } else {
        Write-Host "❌ Authentication Failed: $($authResponse.message)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ Authentication Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure you have a valid user account or create one first" -ForegroundColor Yellow
    exit
}

# Test 3: Get All Arrested Records
Write-Host "`n📋 Testing Get All Arrested Records..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $allRecords = Invoke-RestMethod -Uri "$baseUrl/arrested" -Method GET -Headers $headers
    
    Write-Host "✅ Retrieved Records Successfully" -ForegroundColor Green
    Write-Host "   Total Records: $($allRecords.data.pagination.total)"
    Write-Host "   Records in Page: $($allRecords.data.records.Count)"
} catch {
    Write-Host "❌ Get All Records Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Statistics
Write-Host "`n📊 Testing Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/arrested/statistics" -Method GET -Headers $headers
    
    Write-Host "✅ Statistics Retrieved Successfully" -ForegroundColor Green
    Write-Host "   Total Arrests: $($stats.data.totalArrests)"
    Write-Host "   This Month: $($stats.data.thisMonthArrests)"
    Write-Host "   This Year: $($stats.data.thisYearArrests)"
    Write-Host "   Crime Types: $($stats.data.crimeTypeDistribution.PSObject.Properties.Count) different types"
} catch {
    Write-Host "❌ Statistics Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Create New Arrest Record
Write-Host "`n📝 Testing Create Arrest Record..." -ForegroundColor Yellow
try {
    $newArrest = @{
        fullname = "Test Criminal - $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
        crime_type = "Theft"
        arrest_location = "Kigali City Center"
        date_arrested = (Get-Date).ToString('yyyy-MM-dd')
        id_type = "indangamuntu_yumunyarwanda"
        id_number = "1199900000000001"
    }
    
    $arrestBody = $newArrest | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/arrested" -Method POST -Body $arrestBody -ContentType "application/json" -Headers $headers
    
    if ($createResponse.success) {
        $arrestId = $createResponse.data.arrest_id
        Write-Host "✅ Arrest Record Created Successfully" -ForegroundColor Green
        Write-Host "   Arrest ID: $arrestId"
        Write-Host "   Fullname: $($createResponse.data.fullname)"
        Write-Host "   Crime Type: $($createResponse.data.crime_type)"
        
        # Test 6: Get Specific Record
        Write-Host "`n🔍 Testing Get Specific Record..." -ForegroundColor Yellow
        try {
            $specificRecord = Invoke-RestMethod -Uri "$baseUrl/arrested/$arrestId" -Method GET -Headers $headers
            Write-Host "✅ Retrieved Specific Record Successfully" -ForegroundColor Green
            Write-Host "   Record ID: $($specificRecord.data.arrest_id)"
            Write-Host "   Date Arrested: $($specificRecord.data.date_arrested)"
        } catch {
            Write-Host "❌ Get Specific Record Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 7: Update Record
        Write-Host "`n✏️ Testing Update Record..." -ForegroundColor Yellow
        try {
            $updateData = @{
                crime_type = "Armed Robbery"
                arrest_location = "Updated Location - Nyamirambo"
            }
            
            $updateBody = $updateData | ConvertTo-Json
            $updateResponse = Invoke-RestMethod -Uri "$baseUrl/arrested/$arrestId" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
            
            Write-Host "✅ Record Updated Successfully" -ForegroundColor Green
            Write-Host "   Updated Crime Type: $($updateResponse.data.crime_type)"
            Write-Host "   Updated Location: $($updateResponse.data.arrest_location)"
        } catch {
            Write-Host "❌ Update Record Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Optional: Test 8: Delete Record (uncomment if you want to test deletion)
        <#
        Write-Host "`n🗑️ Testing Delete Record..." -ForegroundColor Yellow
        try {
            $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/arrested/$arrestId" -Method DELETE -Headers $headers
            Write-Host "✅ Record Deleted Successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Delete Record Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        #>
        
    } else {
        Write-Host "❌ Create Record Failed: $($createResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Create Record Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error Details: $errorBody" -ForegroundColor Red
    }
}

# Test 9: Search Records
Write-Host "`n🔍 Testing Search Records..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/arrested?search=theft&limit=5" -Method GET -Headers $headers
    Write-Host "✅ Search Completed Successfully" -ForegroundColor Green
    Write-Host "   Found: $($searchResponse.data.records.Count) records matching 'theft'"
} catch {
    Write-Host "❌ Search Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "📝 Check the results above for any failures." -ForegroundColor Yellow
Write-Host "💡 Make sure to update the credentials at the top of this script if needed." -ForegroundColor Cyan
