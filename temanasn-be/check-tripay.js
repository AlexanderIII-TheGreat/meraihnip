const axios = require('axios');
require('dotenv').config();

async function testTripay() {
  const apiKey = process.env.TRIPAY_API_KEY;
  const link = process.env.TRIPAY_LINK;
  
  console.log('Testing Tripay URL:', link);
  console.log('Testing with API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NONE');

  try {
    const res = await axios.get(`${link}/merchant/payment-channel`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    console.log('SUCCESS connecting to Tripay!');
    console.log('Available channels:', res.data.data.map(c => c.code).join(', '));
  } catch (err) {
    console.log('FAILED connecting to Tripay!');
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Response:', JSON.stringify(err.response.data));
    } else {
      console.log('Error:', err.message);
    }
    
    // Try sandbox url as fallback to diagnose if it is a sandbox key
    if (link !== 'https://tripay.co.id/api-sandbox') {
      console.log('\nRetrying test with Sandbox URL...');
      try {
        const resSandbox = await axios.get('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        });
        console.log('SUCCESS connecting to Tripay Sandbox!');
        console.log('Please change TRIPAY_LINK to https://tripay.co.id/api-sandbox in .env');
      } catch (errSandbox) {
        console.log('Sandbox also FAILED.');
      }
    }
  }
}

testTripay();
