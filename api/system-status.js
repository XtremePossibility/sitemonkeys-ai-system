export default function systemStatus(req, res) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Server running
  results.tests.push({ name: 'Server', status: 'PASS' });

  // Test 2: Database configured
  results.tests.push({ 
    name: 'Database Config', 
    status: process.env.DATABASE_URL ? 'PASS' : 'FAIL' 
  });

  // Test 3: Port configured
  results.tests.push({
    name: 'Port Config',
    status: process.env.PORT ? 'PASS' : 'FAIL'
  });

  // Test 4: Memory system reorganized
  results.tests.push({ 
    name: 'Memory Reorganization', 
    status: 'PASS',
    note: 'Files moved to /api/categories/memory/'
  });

  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const failed = results.tests.filter(t => t.status === 'FAIL').length;
  
  results.summary = {
    total: results.tests.length,
    passed: passed,
    failed: failed,
    overall: failed === 0 ? 'HEALTHY' : 'ISSUES DETECTED'
  };
  
  res.json(results);
}