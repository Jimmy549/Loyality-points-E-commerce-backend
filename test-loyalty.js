const axios = require('axios');

async function testLoyaltyPoints() {
  try {
    console.log('Testing loyalty points functionality...');
    
    // Test 1: Get conversion rates
    console.log('\n1. Testing conversion rates...');
    const ratesResponse = await axios.get('http://localhost:5000/loyalty/rates');
    console.log('Conversion rates:', ratesResponse.data);
    
    // Test 2: Register a test user
    console.log('\n2. Registering test user...');
    const testUser = {
      name: 'Loyalty Test User',
      email: 'loyalty@test.com',
      password: 'testpass123'
    };
    
    let token;
    try {
      const registerResponse = await axios.post('http://localhost:5000/auth/register', testUser);
      token = registerResponse.data.access_token;
      console.log('User registered successfully, points:', registerResponse.data.user.loyaltyPoints);
    } catch (error) {
      if (error.response?.status === 409) {
        // User already exists, try to login
        console.log('User exists, logging in...');
        const loginResponse = await axios.post('http://localhost:5000/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        token = loginResponse.data.access_token;
        console.log('Login successful, points:', loginResponse.data.user.loyaltyPoints);
      } else {
        throw error;
      }
    }
    
    // Test 3: Check user balance
    console.log('\n3. Checking loyalty balance...');
    const balanceResponse = await axios.get('http://localhost:5000/loyalty/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User balance:', balanceResponse.data);
    
    console.log('\n✅ Loyalty points functionality is working!');
    
  } catch (error) {
    console.error('\n❌ Loyalty points test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
  }
}

testLoyaltyPoints();