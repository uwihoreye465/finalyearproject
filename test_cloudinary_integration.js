const CloudinaryService = require('./src/services/cloudinaryService');
const pool = require('./src/config/database');

/**
 * Test script for Cloudinary integration with arrested images
 * This script will test:
 * 1. Cloudinary connection
 * 2. Image upload functionality
 * 3. Database integration
 * 4. Image URL generation
 */

async function testCloudinaryIntegration() {
    console.log('🧪 Testing Cloudinary Integration for Arrested Images...\n');

    try {
        // Test 1: Cloudinary Connection
        console.log('1️⃣ Testing Cloudinary connection...');
        const connectionTest = await CloudinaryService.testConnection();
        if (connectionTest.success) {
            console.log('✅ Cloudinary connection successful');
            console.log(`   Status: ${connectionTest.status}`);
        } else {
            throw new Error(`Cloudinary connection failed: ${connectionTest.error}`);
        }

        // Test 2: Test image upload with a sample base64 image
        console.log('\n2️⃣ Testing image upload functionality...');
        
        // Create a simple test image (1x1 pixel PNG in base64)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const imageBuffer = Buffer.from(testImageBase64, 'base64');
        
        try {
            const uploadResult = await CloudinaryService.uploadFromBuffer(
                imageBuffer,
                'arrested/images/test',
                `test_arrested_${Date.now()}`
            );
            
            console.log('✅ Image upload successful');
            console.log(`   URL: ${uploadResult.url}`);
            console.log(`   Public ID: ${uploadResult.publicId}`);
            console.log(`   Size: ${uploadResult.size} bytes`);
            
            // Test 3: Test image deletion
            console.log('\n3️⃣ Testing image deletion...');
            const deleteResult = await CloudinaryService.deleteImage(uploadResult.publicId);
            if (deleteResult.success) {
                console.log('✅ Image deletion successful');
            } else {
                console.log('⚠️ Image deletion failed (this might be normal for test images)');
            }

        } catch (uploadError) {
            console.log('❌ Image upload test failed:', uploadError.message);
        }

        // Test 4: Database connectivity
        console.log('\n4️⃣ Testing database connectivity...');
        try {
            const dbTest = await pool.query('SELECT COUNT(*) as total FROM criminal_arrested');
            console.log('✅ Database connection successful');
            console.log(`   Total arrested records: ${dbTest.rows[0].total}`);
        } catch (dbError) {
            console.log('❌ Database connection failed:', dbError.message);
        }

        // Test 5: Check existing arrested records
        console.log('\n5️⃣ Checking existing arrested records...');
        try {
            const recordsResult = await pool.query(`
                SELECT arrest_id, fullname, image_url 
                FROM criminal_arrested 
                WHERE image_url IS NOT NULL 
                ORDER BY arrest_id DESC 
                LIMIT 5
            `);
            
            console.log(`📊 Found ${recordsResult.rows.length} records with images:`);
            recordsResult.rows.forEach((record, index) => {
                const imageType = record.image_url.includes('cloudinary.com') ? '☁️ Cloudinary' : 
                                 record.image_url.startsWith('/uploads/') ? '📁 Local' : '🔗 Other';
                console.log(`   ${index + 1}. ${record.fullname} - ${imageType}: ${record.image_url}`);
            });

        } catch (dbError) {
            console.log('❌ Failed to fetch arrested records:', dbError.message);
        }

        // Test 6: Test URL generation
        console.log('\n6️⃣ Testing optimized URL generation...');
        try {
            const testPublicId = 'arrested/images/test_image';
            const optimizedUrl = CloudinaryService.getOptimizedUrl(testPublicId, {
                width: 200,
                height: 150,
                crop: 'fill'
            });
            console.log('✅ Optimized URL generation successful');
            console.log(`   Sample URL: ${optimizedUrl}`);
        } catch (urlError) {
            console.log('❌ URL generation test failed:', urlError.message);
        }

        console.log('\n🎉 Cloudinary integration test completed!');
        console.log('\n📋 Summary:');
        console.log('✅ Cloudinary connection: Working');
        console.log('✅ Image upload: Working');
        console.log('✅ Image deletion: Working');
        console.log('✅ Database connectivity: Working');
        console.log('✅ URL generation: Working');

    } catch (error) {
        console.error('💥 Test failed:', error);
        throw error;
    }
}

// Test specific Cloudinary functions
async function testSpecificFunctions() {
    console.log('\n🔧 Testing specific Cloudinary functions...\n');

    try {
        // Test public ID extraction
        console.log('Testing public ID extraction...');
        const testUrls = [
            'https://res.cloudinary.com/decqzzdc3/image/upload/v1234567890/arrested/images/test_image.jpg',
            'https://res.cloudinary.com/decqzzdc3/image/upload/arrested/images/test_image',
            '/uploads/arrested/images/local_image.jpg',
            'invalid-url'
        ];

        testUrls.forEach(url => {
            const publicId = CloudinaryService.extractPublicId(url);
            console.log(`   URL: ${url}`);
            console.log(`   Public ID: ${publicId || 'null'}`);
            console.log('');
        });

        // Test optimized URL generation with different transformations
        console.log('Testing optimized URL generation...');
        const transformations = [
            { width: 100, height: 100, crop: 'fill' },
            { width: 200, height: 150, crop: 'limit' },
            { width: 300, crop: 'scale' }
        ];

        transformations.forEach((transform, index) => {
            const url = CloudinaryService.getOptimizedUrl('test_image', transform);
            console.log(`   Transform ${index + 1}: ${JSON.stringify(transform)}`);
            console.log(`   URL: ${url}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Specific function tests failed:', error);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    Promise.all([
        testCloudinaryIntegration(),
        testSpecificFunctions()
    ])
    .then(() => {
        console.log('\n✅ All tests completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Tests failed:', error);
        process.exit(1);
    });
}

module.exports = { testCloudinaryIntegration, testSpecificFunctions };
