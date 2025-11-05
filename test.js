// Test script for the proxy server
const { ProxyAgent } = require("undici");

const PROXY_URL = "http://localhost:8080";

async function testProxy() {
  console.log("Starting proxy tests...\n");

  const client = new ProxyAgent(PROXY_URL);

  // Test 1: Simple HTTPS GET request
  console.log("Test 1: HTTPS GET request to api.github.com");
  try {
    const response = await fetch("https://api.github.com/zen", {
      dispatcher: client,
    });
    const data = await response.text();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Response: ${data}`);
    console.log();
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }

  // Test 2: HTTPS POST request with JSON body
  console.log("Test 2: HTTPS POST request with JSON body");
  try {
    const requestBody = {
      test: "data",
      timestamp: Date.now(),
    };

    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      dispatcher: client,
    });

    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Received back: ${JSON.stringify(data.json)}`);
    console.log();
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }

  // Test 3: HTTP GET request
  console.log("Test 3: HTTP GET request");
  try {
    const response = await fetch("http://httpbin.org/user-agent", {
      dispatcher: client,
    });
    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ User-Agent: ${data["user-agent"]}`);
    console.log();
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }

  // Test 4: Custom headers
  console.log("Test 4: Request with custom headers");
  try {
    const response = await fetch("https://httpbin.org/headers", {
      method: "GET",
      headers: {
        "X-Custom-Header": "test-value",
        "User-Agent": "ProxyTestScript/1.0",
      },
      dispatcher: client,
    });

    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Headers received by server:`, data.headers);
    console.log();
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }

  // Test 5: Large response
  console.log("Test 5: Large response handling");
  try {
    const response = await fetch("https://httpbin.org/bytes/10000", {
      dispatcher: client,
    });
    const buffer = await response.arrayBuffer();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Received ${buffer.byteLength} bytes`);
    console.log();
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }

  console.log("All tests completed!");
}

// Run tests
console.log(`Testing proxy at ${PROXY_URL}`);
console.log("Make sure the proxy server is running on port 8080\n");

testProxy().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
