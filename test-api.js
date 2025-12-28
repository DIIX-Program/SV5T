import axios from 'axios';

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await axios.get('http://localhost:5000/api/students/all');
    console.log('\n✓ API Response received');
    console.log('Success:', response.data.success);
    console.log('Count:', response.data.count);
    console.log('Data:', JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
