-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_rwandan_citizens_national_id ON rwandan_citizens(national_id);
CREATE INDEX IF NOT EXISTS idx_sinners_record_citizen_id ON sinners_record(citizen_id);
CREATE INDEX IF NOT EXISTS idx_sinners_record_passport_id ON sinners_record(passport_id);
CREATE INDEX IF NOT EXISTS idx_victim_citizen_id ON victim(citizen_id);
CREATE INDEX IF NOT EXISTS idx_sinners_record_crime_type ON sinners_record(crime_type);
CREATE INDEX IF NOT EXISTS idx_victim_crime_type ON victim(crime_type);

-- Insert sample admin user (password: admin123)
INSERT INTO users (sector, fullname, position, email, password, role, is_verified, is_approved)
VALUES (
  'NIDA',
  'System Administrator', 
  'IT Manager',
  'admin@findsinners.rw',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewreZiKBoqXc.Hq.',
  'admin',
  true,
  true
) ON CONFLICT (email) DO NOTHING;