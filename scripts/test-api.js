/**
 * Test the analytics API endpoints
 */

async function testAPI() {
  const baseUrl = 'http://localhost:3000';

  console.log('=== TESTING ANALYTICS API ENDPOINTS ===\n');

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  console.log(`Testing with today's date: ${todayStr}\n`);

  // Test 1: Overview API without date filter
  console.log('Test 1: GET /api/analytics/overview (all time)');
  try {
    const response1 = await fetch(`${baseUrl}/api/analytics/overview`);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Success:', JSON.stringify(data1, null, 2));
    } else {
      console.log(`✗ Failed: ${response1.status} ${response1.statusText}`);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test 2: Overview API with today's date
  console.log(`\nTest 2: GET /api/analytics/overview?startDate=${todayStr}&endDate=${todayStr}`);
  try {
    const response2 = await fetch(`${baseUrl}/api/analytics/overview?startDate=${todayStr}&endDate=${todayStr}`);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✓ Success:', JSON.stringify(data2, null, 2));
    } else {
      console.log(`✗ Failed: ${response2.status} ${response2.statusText}`);
      const text = await response2.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test 3: Top drawings with today's date
  console.log(`\nTest 3: GET /api/analytics/top-drawings?metric=downloads&limit=5&startDate=${todayStr}&endDate=${todayStr}`);
  try {
    const response3 = await fetch(`${baseUrl}/api/analytics/top-drawings?metric=downloads&limit=5&startDate=${todayStr}&endDate=${todayStr}`);
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✓ Success:', JSON.stringify(data3, null, 2));
    } else {
      console.log(`✗ Failed: ${response3.status} ${response3.statusText}`);
      const text = await response3.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
}

testAPI();
