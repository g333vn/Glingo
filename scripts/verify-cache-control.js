#!/usr/bin/env node

/**
 * Script to verify Cache-Control headers for different file types
 * Usage: node scripts/verify-cache-control.js <domain>
 * Example: node scripts/verify-cache-control.js https://your-project.vercel.app
 */

import https from 'https';

const domain = process.argv[2] || 'https://your-project.vercel.app';
const baseUrl = domain.replace(/\/$/, '');

console.log('🔍 Verifying Cache-Control Headers...\n');
console.log(`Domain: ${baseUrl}\n`);

// Test paths based on actual file structure
const testPaths = [
  {
    path: '/',
    type: 'HTML',
    expected: 'public, max-age=0, must-revalidate',
    description: 'Main HTML page - should not be cached'
  },
  {
    path: '/index.html',
    type: 'HTML',
    expected: 'public, max-age=0, must-revalidate',
    description: 'HTML file - should not be cached'
  },
  {
    path: '/assets/index-B3tJv6Eg.js', // Example JS asset (will check if exists, otherwise try pattern)
    type: 'Static Asset (JS)',
    expected: 'public, max-age=31536000, immutable',
    description: 'JavaScript file - should cache 1 year'
  },
  {
    path: '/assets/index-BwbYsnB4.css', // Example CSS asset
    type: 'Static Asset (CSS)',
    expected: 'public, max-age=31536000, immutable',
    description: 'CSS file - should cache 1 year'
  },
  {
    path: '/logo/main.png',
    type: 'Image',
    expected: 'public, max-age=86400, stale-while-revalidate=604800',
    description: 'Image file - should cache 1 day with stale-while-revalidate'
  },
  {
    path: '/flags/vietnam.svg',
    type: 'Image (SVG)',
    expected: 'public, max-age=86400, stale-while-revalidate=604800',
    description: 'SVG image - should cache 1 day'
  }
];

function checkHeader(url, path, type, expected) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url + path);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Cache-Control-Verifier/1.0'
      }
    };

    const req = https.request(options, (res) => {
      const cacheControl = res.headers['cache-control'];
      const statusCode = res.statusCode;
      
      // Check if file exists (200) or not found (404)
      if (statusCode === 404) {
        console.log(`⚠️  ${type}`);
        console.log(`   Path: ${path}`);
        console.log(`   Status: 404 Not Found (file may have different hash/name)`);
        console.log(`   💡 This is normal for hashed assets - check actual asset names in browser DevTools\n`);
        resolve({ path, type, hasHeader: false, value: null, status: 404, note: 'File not found' });
        return;
      }
      
      const status = cacheControl ? '✅' : '❌';
      
      console.log(`${status} ${type}`);
      console.log(`   Path: ${path}`);
      console.log(`   Status: ${statusCode}`);
      
      if (cacheControl) {
        console.log(`   Cache-Control: ${cacheControl}`);
        
        if (expected) {
          // Check if matches expected (more flexible matching)
          const expectedParts = expected.split(',').map(s => s.trim());
          const actualParts = cacheControl.split(',').map(s => s.trim());
          
          // Check if key parts match
          const keyMatches = expectedParts.some(exp => 
            actualParts.some(act => act.includes(exp.split('=')[0]))
          );
          
          if (cacheControl === expected) {
            console.log(`   ✅ Perfect match!`);
          } else if (keyMatches || cacheControl.includes(expected.split(',')[0].trim())) {
            console.log(`   ⚠️  Partial match - check if correct`);
            console.log(`   Expected: ${expected}`);
          } else {
            console.log(`   ❌ Does NOT match expected`);
            console.log(`   Expected: ${expected}`);
          }
        }
      } else {
        console.log(`   ❌ Cache-Control header missing`);
        if (expected) {
          console.log(`   Expected: ${expected}`);
        }
      }
      console.log('');
      
      resolve({ 
        path, 
        type, 
        hasHeader: !!cacheControl, 
        value: cacheControl,
        status: statusCode,
        matches: cacheControl === expected
      });
    });

    req.on('error', (error) => {
      console.log(`⚠️  ${type} - ${path}`);
      console.log(`   Error: ${error.message}\n`);
      resolve({ path, type, hasHeader: false, error: error.message });
    });

    req.end();
  });
}

async function verifyAll() {
  console.log('─'.repeat(60));
  
  const results = [];
  
  for (const test of testPaths) {
    const result = await checkHeader(baseUrl, test.path, test.type, test.expected);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('─'.repeat(60));
  console.log(`\n📊 Summary:\n`);
  
  const withHeaders = results.filter(r => r.hasHeader && r.status === 200).length;
  const withoutHeaders = results.filter(r => !r.hasHeader && r.status === 200).length;
  const notFound = results.filter(r => r.status === 404).length;
  const correct = results.filter(r => r.matches === true).length;
  
  console.log(`   ✅ With Cache-Control: ${withHeaders}/${results.length - notFound}`);
  console.log(`   ❌ Without Cache-Control: ${withoutHeaders}/${results.length - notFound}`);
  console.log(`   ⚠️  Not Found (404): ${notFound} (normal for hashed assets)`);
  console.log(`   ✅ Correct values: ${correct}/${withHeaders}`);
  
  if (withoutHeaders > 0) {
    console.log(`\n⚠️  Some files are missing Cache-Control headers.`);
    console.log(`   Please add Cache-Control headers via Vercel Dashboard.`);
    console.log(`   See: VERCEL_DASHBOARD_CACHE_CONTROL_STEPS.md`);
  } else if (withHeaders > 0 && correct < withHeaders) {
    console.log(`\n⚠️  Some Cache-Control headers have incorrect values.`);
    console.log(`   Please check and update via Vercel Dashboard.`);
  } else if (withHeaders > 0) {
    console.log(`\n✅ All tested files have correct Cache-Control headers!`);
  }
  
  console.log(`\n💡 Note:`);
  console.log(`   - Hashed assets (JS/CSS) may have different names - check browser DevTools`);
  console.log(`   - Add Cache-Control headers via Vercel Dashboard (not vercel.json)`);
  console.log(`   - See: VERCEL_DASHBOARD_CACHE_CONTROL_STEPS.md for instructions`);
}

verifyAll().catch(console.error);

