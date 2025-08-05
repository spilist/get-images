// Test script for the scraper API
// You can run this locally or use it as a reference for frontend integration

// Example 1: Single query search
async function testSingleQuery() {
  const response = await fetch('/api/scraper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: '삼계탕',
      max_results: 3
    })
  });
  
  const result = await response.json();
  console.log('Single query result:', result);
}

// Example 2: Multiple keywords search
async function testMultipleKeywords() {
  const response = await fetch('/api/scraper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keywords: ['삼계탕', '장어구이', '추어탕'],
      max_keywords: 10,
      max_results_per_keyword: 2
    })
  });
  
  const result = await response.json();
  console.log('Multiple keywords result:', result);
}

// Example 3: Using curl from command line
console.log(`
Test with curl:

# Single query:
curl -X POST http://localhost:3000/api/scraper \\
  -H "Content-Type: application/json" \\
  -d '{"query": "삼계탕", "max_results": 3}'

# Multiple keywords:
curl -X POST http://localhost:3000/api/scraper \\
  -H "Content-Type: application/json" \\
  -d '{"keywords": ["삼계탕", "장어구이"], "max_results_per_keyword": 2}'
`);

// Uncomment to run tests (requires running in browser or Node.js environment)
// testSingleQuery();
// testMultipleKeywords();