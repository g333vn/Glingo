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

// Test paths - adjust based on your actual file structure
const testPaths = [
  {
    path: '/',
    type: 'HTML',
    expected: 'public, max-age=0, must-revalidate'
  },
  {
    path: '/index.html',
    type: 'HTML',
    expected: 'public, max-age=0, must-revalidate'
  },
  {
    path: '/assets/index.js', // Replace with actual asset path
    type: 'Static Asset (JS)',
    expected: 'public, max-age=31536000, immutable'
  },
  {
    path: '/assets/index.css', // Replace with actual asset path
    type: 'Static Asset (CSS)',
    expected: 'public, max-age=31536000, immutable'
  },
  {
    path: '/logo/main.png', // Replace with actual image path
    type: 'Image',
    expected: 'public, max-age=86400, stale-while-revalidate=604800'
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
      const status = cacheControl ? '✅' : '❌';
      
      console.log(`${status} ${type}`);
      console.log(`   Path: ${path}`);
      
      if (cacheControl) {
        console.log(`   Cache-Control: ${cacheControl}`);
        
        if (expected) {
          const matches = cacheControl.includes(expected.split(',')[0].trim());
          if (matches) {
            console.log(`   ✅ Matches expected pattern`);
          } else {
            console.log(`   ⚠️  Expected: ${expected}`);
          }
        }
      } else {
        console.log(`   ❌ Cache-Control header missing`);
      }
      console.log('');
      
      resolve({ path, type, hasHeader: !!cacheControl, value: cacheControl });
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
  
  const withHeaders = results.filter(r => r.hasHeader).length;
  const withoutHeaders = results.filter(r => !r.hasHeader).length;
  
  console.log(`   ✅ With Cache-Control: ${withHeaders}/${results.length}`);
  console.log(`   ❌ Without Cache-Control: ${withoutHeaders}/${results.length}`);
  
  if (withoutHeaders > 0) {
    console.log(`\n⚠️  Some files are missing Cache-Control headers.`);
    console.log(`   Please add Cache-Control headers via Vercel Dashboard.`);
    console.log(`   See: VERCEL_CACHE_CONTROL_SETUP.md`);
  } else {
    console.log(`\n✅ All tested files have Cache-Control headers!`);
  }
  
  console.log(`\n💡 Note: Update test paths in this script to match your actual file structure.`);
}

verifyAll().catch(console.error);

