require('dotenv').config();
const axios = require('axios');

// Test authentication and notice creation
async function testAuthAndNotices() {
  try {
    const baseURL = 'http://localhost:3500/api';
    
    console.log('🔐 Testing authentication...');
    
    // Test login
    const loginResponse = await axios.post(`${baseURL}/auth`, {
      email: 'test@admin.com',             // Using test admin email
      password: 'password123',             // Test password
      role: 5150                           // Admin role
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.data.user);
    console.log('Token:', loginResponse.data.data.accessToken ? 'Present' : 'Missing');
    
    // Test creating a notice
    console.log('\n📝 Testing notice creation...');
    console.log('Access token:', loginResponse.data.data.accessToken);
    
    const noticeData = {
      title: 'Test Notice from API',
      content: 'This is a test notice created via API',
      targetAudience: ['all'],
      priority: 'medium',
      category: 'general',
      tags: ['test', 'api']
    };
    
    console.log('Notice data:', noticeData);
    
    try {
      const noticeResponse = await axios.post(`${baseURL}/notices`, noticeData, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('✅ Notice created successfully');
      console.log('Notice ID:', noticeResponse.data.data._id);
    } catch (noticeError) {
      console.error('Notice creation error:', noticeError.response?.data || noticeError.message);
      console.error('Status:', noticeError.response?.status);
      console.error('Headers:', noticeError.response?.headers);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔍 401 Unauthorized - Check if admin credentials are correct');
    }
  }
}

testAuthAndNotices();
