// OAuth Configuration Verification Script
require('dotenv').config();

console.log('🔍 Verifying OAuth Configuration...\n');

const requiredEnvVars = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GITHUB_CLIENT_ID': process.env.GITHUB_CLIENT_ID,
  'GITHUB_CLIENT_SECRET': process.env.GITHUB_CLIENT_SECRET,
  'DISCORD_CLIENT_ID': process.env.DISCORD_CLIENT_ID,
  'DISCORD_CLIENT_SECRET': process.env.DISCORD_CLIENT_SECRET,
  'BACKEND_URL': process.env.BACKEND_URL,
  'FRONTEND_URL': process.env.FRONTEND_URL,
  'MONGODB_URI': process.env.MONGODB_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
};

let allValid = true;

console.log('📋 Environment Variables Check:\n');
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value && value.trim() !== '') {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allValid = false;
  }
}

console.log('\n📍 OAuth Callback URLs:\n');
console.log(`Google:  ${process.env.BACKEND_URL}/auth/google/callback`);
console.log(`GitHub:  ${process.env.BACKEND_URL}/auth/github/callback`);
console.log(`Discord: ${process.env.BACKEND_URL}/auth/discord/callback`);

console.log('\n🌐 Frontend Redirect URL:\n');
console.log(`${process.env.FRONTEND_URL}/auth/social`);

if (allValid) {
  console.log('\n✅ All OAuth configurations are present!');
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure these callback URLs are registered in:');
  console.log('   - Google Cloud Console');
  console.log('   - GitHub OAuth App Settings');
  console.log('   - Discord Developer Portal');
  console.log('2. Start the backend: npm run start:dev');
  console.log('3. Start the frontend: npm run dev');
  console.log('4. Test social login at: http://localhost:3000/auth/login');
} else {
  console.log('\n❌ Some OAuth configurations are missing!');
  console.log('Please check your .env file.');
  process.exit(1);
}
