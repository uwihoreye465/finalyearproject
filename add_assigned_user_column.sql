-- Step 1: Add assigned_user_id column to notification table
-- This will allow us to assign notifications to specific users

ALTER TABLE notification
ADD COLUMN assigned_user_id INTEGER;

-- Add index for better performance when querying by assigned_user_id
CREATE INDEX idx_notification_assigned_user_id ON notification(assigned_user_id);

-- Add comment to explain the column purpose
COMMENT ON COLUMN notification.assigned_user_id IS 'User ID of the near_rib user assigned to this notification based on sector matching';

-- Step 2: Create a function to assign notifications to users
-- This function will match notifications with users based on near_rib = sector

CREATE OR REPLACE FUNCTION assign_notifications_to_users()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update notifications to assign them to users with role = 'near_rib'
    -- where notification.near_rib matches user.sector
    UPDATE notification n
    SET assigned_user_id = u.user_id
    FROM users u
    WHERE n.near_rib = u.sector
      AND u.role = 'near_rib'
      AND n.assigned_user_id IS NULL; -- Only update unassigned notifications
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a view for easy querying of user notifications
CREATE OR REPLACE VIEW user_notifications AS
SELECT 
    n.not_id,
    n.near_rib,
    n.fullname,
    n.address,
    n.phone,
    n.message,
    n.created_at,
    n.is_read,
    n.latitude,
    n.longitude,
    n.location_name,
    n.assigned_user_id,
    u.user_id,
    u.fullname as assigned_user_name,
    u.sector as user_sector,
    u.position as user_position
FROM notification n
JOIN users u ON n.assigned_user_id = u.user_id
WHERE u.role = 'near_rib';

-- Step 4: Create a function to get notifications for a specific user
CREATE OR REPLACE FUNCTION get_user_notifications(user_id_param INTEGER)
RETURNS TABLE (
    not_id INTEGER,
    near_rib VARCHAR,
    fullname VARCHAR,
    address TEXT,
    phone VARCHAR,
    message TEXT,
    created_at TIMESTAMP,
    is_read BOOLEAN,
    latitude NUMERIC,
    longitude NUMERIC,
    location_name VARCHAR,
    assigned_user_id INTEGER,
    user_sector VARCHAR,
    user_position VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.not_id,
        n.near_rib,
        n.fullname,
        n.address,
        n.phone,
        n.message,
        n.created_at,
        n.is_read,
        n.latitude,
        n.longitude,
        n.location_name,
        n.assigned_user_id,
        u.sector,
        u.position
    FROM notification n
    JOIN users u ON n.assigned_user_id = u.user_id
    WHERE u.user_id = user_id_param
      AND u.role = 'near_rib'
    ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Test the assignment function
-- This will assign all existing notifications to appropriate users
SELECT assign_notifications_to_users() as notifications_assigned;

-- Step 6: Verify the assignments
SELECT 
    n.not_id,
    n.near_rib,
    n.fullname,
    n.message,
    n.assigned_user_id,
    u.fullname as assigned_user_name,
    u.sector as user_sector
FROM notification n
LEFT JOIN users u ON n.assigned_user_id = u.user_id
ORDER BY n.created_at DESC;
