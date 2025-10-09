const pool = require('./src/config/database');
const CloudinaryService = require('./src/services/cloudinaryService');
const fs = require('fs');
const path = require('path');

/**
 * Migration script to upload existing local arrested images to Cloudinary
 * This script will:
 * 1. Find all arrested records with local image URLs
 * 2. Upload the local images to Cloudinary
 * 3. Update the database with the new Cloudinary URLs
 * 4. Clean up local files (optional)
 */

async function migrateArrestedImagesToCloudinary() {
    console.log('🚀 Starting arrested images migration to Cloudinary...');
    
    try {
        // Test Cloudinary connection first
        console.log('🔍 Testing Cloudinary connection...');
        const connectionTest = await CloudinaryService.testConnection();
        if (!connectionTest.success) {
            throw new Error(`Cloudinary connection failed: ${connectionTest.error}`);
        }
        console.log('✅ Cloudinary connection successful');

        // Get all arrested records with local image URLs
        console.log('📋 Fetching arrested records with local images...');
        const result = await pool.query(`
            SELECT arrest_id, fullname, image_url 
            FROM criminal_arrested 
            WHERE image_url IS NOT NULL 
            AND image_url LIKE '/uploads/arrested/images/%'
            ORDER BY arrest_id
        `);

        const records = result.rows;
        console.log(`📊 Found ${records.length} records with local images to migrate`);

        if (records.length === 0) {
            console.log('✅ No local images found to migrate');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Process each record
        for (const record of records) {
            try {
                console.log(`\n🔄 Processing record ${record.arrest_id}: ${record.fullname}`);
                console.log(`📁 Local image URL: ${record.image_url}`);

                // Extract filename from image_url
                const filename = record.image_url.replace('/uploads/arrested/images/', '');
                const localFilePath = path.join(process.cwd(), 'uploads', 'arrested', 'images', filename);

                // Check if local file exists
                if (!fs.existsSync(localFilePath)) {
                    console.log(`⚠️ Local file not found: ${localFilePath}`);
                    errors.push({
                        arrest_id: record.arrest_id,
                        fullname: record.fullname,
                        error: 'Local file not found',
                        localPath: localFilePath
                    });
                    errorCount++;
                    continue;
                }

                // Upload to Cloudinary
                console.log(`📤 Uploading to Cloudinary...`);
                const uploadResult = await CloudinaryService.migrateLocalImage(
                    localFilePath, 
                    'arrested/images'
                );

                if (!uploadResult.success) {
                    console.log(`❌ Upload failed: ${uploadResult.error}`);
                    errors.push({
                        arrest_id: record.arrest_id,
                        fullname: record.fullname,
                        error: uploadResult.error,
                        localPath: localFilePath
                    });
                    errorCount++;
                    continue;
                }

                // Update database with new Cloudinary URL
                console.log(`💾 Updating database...`);
                await pool.query(
                    'UPDATE criminal_arrested SET image_url = $1 WHERE arrest_id = $2',
                    [uploadResult.cloudinaryUrl, record.arrest_id]
                );

                console.log(`✅ Successfully migrated: ${uploadResult.cloudinaryUrl}`);
                successCount++;

                // Optional: Clean up local file (uncomment if you want to delete local files)
                // try {
                //     fs.unlinkSync(localFilePath);
                //     console.log(`🗑️ Local file cleaned up: ${localFilePath}`);
                // } catch (cleanupError) {
                //     console.warn(`⚠️ Failed to clean up local file: ${cleanupError.message}`);
                // }

            } catch (error) {
                console.error(`❌ Error processing record ${record.arrest_id}:`, error.message);
                errors.push({
                    arrest_id: record.arrest_id,
                    fullname: record.fullname,
                    error: error.message,
                    localPath: record.image_url
                });
                errorCount++;
            }
        }

        // Summary
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully migrated: ${successCount} images`);
        console.log(`❌ Failed migrations: ${errorCount} images`);
        console.log(`📈 Success rate: ${((successCount / records.length) * 100).toFixed(2)}%`);

        if (errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. Record ${error.arrest_id} (${error.fullname}): ${error.error}`);
            });
        }

        console.log('\n🎉 Migration completed!');
        
        // Test a few migrated records
        console.log('\n🔍 Testing migrated records...');
        const testResult = await pool.query(`
            SELECT arrest_id, fullname, image_url 
            FROM criminal_arrested 
            WHERE image_url LIKE '%cloudinary.com%'
            LIMIT 3
        `);
        
        console.log('📋 Sample migrated records:');
        testResult.rows.forEach(record => {
            console.log(`- ${record.fullname}: ${record.image_url}`);
        });

    } catch (error) {
        console.error('💥 Migration failed:', error);
        throw error;
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateArrestedImagesToCloudinary()
        .then(() => {
            console.log('✅ Migration script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateArrestedImagesToCloudinary };
