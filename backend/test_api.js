import axios from 'axios';

const baseURL = 'http://localhost:5000';

async function runTests() {
  console.log('--- STARTING API TESTS ---');

  try {
    // 1. Admin Test
    console.log('\nLogging in as Admin...');
    const adminLogin = await axios.post(`${baseURL}/api/users/login`, {
      email: 'admin@example.com',
      password: 'password123',
    });
    const adminToken = adminLogin.data.token;
    console.log('Admin Login: SUCCESS');

    console.log('Fetching Admin Stats...');
    const statsRes = await axios.get(`${baseURL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Admin Stats: SUCCESS', Object.keys(statsRes.data));

    console.log('Fetching All Violations (Admin)...');
    const allViolationsRes = await axios.get(`${baseURL}/api/violations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('All Violations: SUCCESS, Count:', allViolationsRes.data.length);


    // 2. Police Test
    console.log('\nLogging in as Police...');
    const policeLogin = await axios.post(`${baseURL}/api/users/login`, {
      email: 'police@example.com',
      password: 'password123',
    });
    const policeToken = policeLogin.data.token;
    console.log('Police Login: SUCCESS');

    console.log('Searching for Vehicle BA 2 PA 1234...');
    const searchRes = await axios.get(`${baseURL}/api/vehicles/BA 2 PA 1234`, {
      headers: { Authorization: `Bearer ${policeToken}` },
    });
    console.log('Vehicle Search: SUCCESS, History Length:', searchRes.data.history?.length);


    // 3. Owner Test
    console.log('\nLogging in as Owner...');
    const ownerLogin = await axios.post(`${baseURL}/api/users/login`, {
      email: 'owner@example.com',
      password: 'password123',
    });
    const ownerToken = ownerLogin.data.token;
    console.log('Owner Login: SUCCESS');

    console.log('Fetching My Violations...');
    const myViolationsRes = await axios.get(`${baseURL}/api/violations/my`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log('My Violations: SUCCESS, Count:', myViolationsRes.data.length);

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    console.error(error.response ? error.response.data : error.message);
  }
}

runTests();
