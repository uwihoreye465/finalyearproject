# PowerShell script to test arrested image upload API
# Make sure your server is running on localhost:3000

$baseUrl = "http://localhost:3000/api/v1/arrested"
$token = "your-jwt-token-here"  # Replace with actual token

Write-Host "🚔 Testing Arrested Image Upload API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Create arrested record with image upload
Write-Host "`n🧪 Test 1: Creating arrested record with image upload..." -ForegroundColor Yellow

# Create a simple test image file
$testImagePath = "test_image.jpg"
if (-not (Test-Path $testImagePath)) {
    # Create a minimal JPEG file (1x1 pixel)
    $jpegBytes = @(
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
    )
    [System.IO.File]::WriteAllBytes($testImagePath, $jpegBytes)
    Write-Host "✅ Created test image: $testImagePath" -ForegroundColor Green
}

try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"fullname`"",
        "",
        "John Doe Test",
        "--$boundary",
        "Content-Disposition: form-data; name=`"crime_type`"",
        "",
        "Theft",
        "--$boundary",
        "Content-Disposition: form-data; name=`"date_arrested`"",
        "",
        "2024-01-15",
        "--$boundary",
        "Content-Disposition: form-data; name=`"arrest_location`"",
        "",
        "Kigali, Rwanda",
        "--$boundary",
        "Content-Disposition: form-data; name=`"id_type`"",
        "",
        "indangamuntu_yumunyarwanda",
        "--$boundary",
        "Content-Disposition: form-data; name=`"id_number`"",
        "",
        "1234567890123456",
        "--$boundary",
        "Content-Disposition: form-data; name=`"image`"; filename=`"test_image.jpg`"",
        "Content-Type: image/jpeg",
        "",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([System.IO.File]::ReadAllBytes($testImagePath)),
        "--$boundary--"
    )
    
    $body = $bodyLines -join $LF
    $bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body)
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $bodyBytes -Headers $headers -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "✅ Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    if ($response.success -and $response.data.image_url) {
        Write-Host "✅ Image URL saved: $($response.data.image_url)" -ForegroundColor Green
        $arrestId = $response.data.arrest_id
    } else {
        Write-Host "❌ Image URL not saved properly" -ForegroundColor Red
        $arrestId = $null
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $arrestId = $null
}

# Test 2: Create arrested record without image (JSON)
Write-Host "`n🧪 Test 2: Creating arrested record without image (JSON)..." -ForegroundColor Yellow

try {
    $jsonData = @{
        fullname = "Jane Smith Test"
        crime_type = "Fraud"
        date_arrested = "2024-01-16"
        arrest_location = "Huye, Rwanda"
        id_type = "passport"
        id_number = "P123456789"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $jsonData -Headers $headers
    
    Write-Host "✅ Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    if (-not $arrestId) {
        $arrestId = $response.data.arrest_id
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get arrested record and verify image URL
if ($arrestId) {
    Write-Host "`n🧪 Test 3: Getting arrested record to verify image URL..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl/$arrestId" -Method Get -Headers $headers
        
        Write-Host "✅ Response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
        if ($response.success -and $response.data.image_url) {
            Write-Host "✅ Image URL found: $($response.data.image_url)" -ForegroundColor Green
            
            # Check if image file exists
            $filename = $response.data.image_url -replace "/uploads/arrested/images/", ""
            $filePath = "uploads\arrested\images\$filename"
            
            if (Test-Path $filePath) {
                Write-Host "✅ Image file exists on disk: $filePath" -ForegroundColor Green
            } else {
                Write-Host "❌ Image file not found on disk: $filePath" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No image URL found" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Test image download
if ($arrestId) {
    Write-Host "`n🧪 Test 4: Testing image download..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/$arrestId/download/image" -Method Get -Headers $headers
        
        Write-Host "✅ Image download successful" -ForegroundColor Green
        Write-Host "✅ Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
        Write-Host "✅ Content-Length: $($response.Headers.'Content-Length')" -ForegroundColor Green
        
        # Save downloaded image
        $downloadPath = "downloaded_test_image.jpg"
        [System.IO.File]::WriteAllBytes($downloadPath, $response.Content)
        Write-Host "✅ Downloaded image saved to: $downloadPath" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Tests completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
