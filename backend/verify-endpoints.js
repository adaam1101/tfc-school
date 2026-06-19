const http = require('http');

console.log("==========================================================");
console.log("Running Programmatic Integration Tests for TFC School API");
console.log("==========================================================");

// Require server to start it programmatically
process.env.PORT = 5099; // Use distinct port for tests
process.env.MONGODB_URI = ""; // Enforce local JSON DB fallback for tests
const server = require('./server');

const BASE_URL = "http://localhost:5099/api";

// Helper to make fetch requests using native http module since we want to be 100% dependency-free
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = { text: body };
        }
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(json)
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Sleep utility
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTests() {
  try {
    // Wait for server database seeding
    console.log("Waiting for database seeding...");
    await sleep(2500);

    // Test 1: Admin Login
    console.log("\n[Test 1] Authenticating as Admin...");
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@tfcschool.dz', password: 'Admin123!' }
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    console.log("✅ Admin logged in successfully! Token received.");
    const adminToken = loginData.token;

    // Test 2: Submit Enrollment Form (Public)
    console.log("\n[Test 2] Submitting new student pre-registration (Public Inscription)...");
    const enrollRes = await request('/enrollments', {
      method: 'POST',
      body: {
        name: 'Mohamed Belkacem',
        age: 21,
        phone: '0555998877',
        formation: 'Informatique (Word/Excel)',
        isOrphan: false,
        isTwoFormations: false
      }
    });

    const enrollData = await enrollRes.json();
    if (!enrollRes.ok || !enrollData.enrollment) {
      throw new Error(`Enrollment failed: ${JSON.stringify(enrollData)}`);
    }
    console.log("✅ Enrollment pre-registration submitted successfully!");
    const studentEnrollId = enrollData.enrollment._id;

    // Test 3: Approve Enrollment (Admin)
    console.log("\n[Test 3] Approving enrollment as Admin & verifying credentials generation...");
    const approveRes = await request(`/enrollments/${studentEnrollId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const approveData = await approveRes.json();
    if (!approveRes.ok || !approveData.credentials) {
      throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);
    }
    console.log("✅ Enrollment approved! Credentials auto-generated:");
    console.log(`   - Email: ${approveData.credentials.email}`);
    console.log(`   - Temp Password: ${approveData.credentials.password}`);
    const generatedEmail = approveData.credentials.email;
    const generatedPassword = approveData.credentials.password;

    // Test 4: Log in as newly created Student
    console.log("\n[Test 4] Logging in as newly generated Student account...");
    const studentLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: generatedEmail, password: generatedPassword }
    });
    
    const studentLoginData = await studentLoginRes.json();
    if (!studentLoginRes.ok || !studentLoginData.token) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLoginData)}`);
    }
    console.log("✅ Student authenticated successfully!");

    // Test 5: Verify payments generated
    console.log("\n[Test 5] Checking auto-generated student invoices...");
    const paymentsRes = await request('/payments', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentLoginData.token}` }
    });
    const payments = await paymentsRes.json();
    if (!paymentsRes.ok || payments.length === 0) {
      throw new Error("No invoices found for student!");
    }
    console.log(`✅ Invoice successfully generated for student: ${payments[0].totalAmount} DA (Status: ${payments[0].status})`);

    // Test 6: Brute-Force Lockout checking
    console.log("\n[Test 6] Checking Brute-Force lockout system (5 bad logins)...");
    let isLocked = false;
    for (let i = 1; i <= 5; i++) {
      const badLogin = await request('/auth/login', {
        method: 'POST',
        body: { email: 'admin@tfcschool.dz', password: 'WrongPassword' }
      });
      const badData = await badLogin.json();
      console.log(`   Attempt ${i}/5 response status: ${badLogin.status} - Message: ${badData.message}`);
      if (badLogin.status === 423) {
        isLocked = true;
      }
    }

    if (isLocked) {
      console.log("✅ Lockout system triggered successfully after 5 attempts!");
    } else {
      console.log("❌ Lockout failed to trigger.");
      throw new Error("Brute-force lockout test failed.");
    }

    console.log("\n==========================================================");
    console.log("🎉 ALL PROGRAMMATIC TESTING PASSED SUCCESSFUL!");
    console.log("==========================================================");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Test Suite Failed:", err.message);
    process.exit(1);
  }
}

runTests();
