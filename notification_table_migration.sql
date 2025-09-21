-- Migration to add missing columns to notification table
-- Run this SQL to fix the notification table structure

-- Add missing columns to notification table
ALTER TABLE notification 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN location_name VARCHAR(255),
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX idx_notification_is_read ON notification (is_read);
CREATE INDEX idx_notification_created_at ON notification (created_at);
CREATE INDEX idx_notification_location ON notification (latitude, longitude);

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at column
CREATE TRIGGER update_notification_updated_at 
    BEFORE UPDATE ON notification 
    FOR EACH ROW 
    EXECUTE FUNCTION update_notification_updated_at_column();

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN notification.is_read IS 'Whether the notification has been read by admin/staff';
COMMENT ON COLUMN notification.latitude IS 'GPS latitude coordinate for location tracking';
COMMENT ON COLUMN notification.longitude IS 'GPS longitude coordinate for location tracking';
COMMENT ON COLUMN notification.location_name IS 'Human-readable location name derived from GPS coordinates';
COMMENT ON COLUMN notification.created_at IS 'Timestamp when notification was created';
COMMENT ON COLUMN notification.updated_at IS 'Timestamp when notification was last updated';
