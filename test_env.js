// Load environment variables first
require('dotenv').config();

console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL is not set!');
  console.log('Please create a .env file with your Supabase database URL');
} else {
  console.log('✅ DATABASE_URL is set');
}
