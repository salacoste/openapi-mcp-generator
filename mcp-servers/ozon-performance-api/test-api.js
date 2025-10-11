#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api-performance.ozon.ru:443';
const CLIENT_ID = process.env.OZON_CLIENT_ID;
const CLIENT_SECRET = process.env.OZON_CLIENT_SECRET;

async function getToken() {
  const response = await axios.post(`${BASE_URL}/api/client/token`, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });
  return response.data.access_token;
}

async function testListCampaigns() {
  try {
    const token = await getToken();
    console.log('✅ Got OAuth token');

    // Test 1: Without parameters (should work)
    console.log('\n📝 Test 1: ListCampaigns without parameters');
    const response1 = await axios.get(`${BASE_URL}/api/client/campaign`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Success:', response1.data);

    // Test 2: With default array serialization (will fail)
    console.log('\n📝 Test 2: With campaignIds (default axios serialization)');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/client/campaign`, {
        params: { campaignIds: ['52374', '52375'] },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Success:', response2.data);
    } catch (err) {
      console.log('❌ Failed:', err.response?.status, err.response?.data || err.message);
    }

    // Test 3: With exploded array serialization (should work)
    console.log('\n📝 Test 3: With campaignIds (exploded serialization)');
    const response3 = await axios.get(`${BASE_URL}/api/client/campaign`, {
      params: { campaignIds: ['52374', '52375'] },
      paramsSerializer: {
        indexes: null, // Use repeat format: ?key=value1&key=value2
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Success:', response3.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testListCampaigns();
