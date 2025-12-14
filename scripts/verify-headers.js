#!/usr/bin/env node

/**
 * Script to verify security headers on deployed site
 * Usage: node scripts/verify-headers.js <domain>
 * Example: node scripts/verify-headers.js https://your-project.vercel.app
 */

const https = require('https');
const http = require('http');

const domain = process.argv[2] || 'https://your-project.vercel.app';

// Remove protocol if present
const url = domain.replace(/^https?:\/\//, '');
const [hostname, ...pathParts] = url.split('/');
const path = '/' + pathParts.join('/');

console.log('🔍 Verifying Security Headers...\n');
console.log(`Domain: ${domain}`);
console.log(`Hostname: ${hostname}`);
console.log(`Path: ${path}\n`);

const options = {
  hostname: hostname,
  port: 443,
  path: path,
  method: 'HEAD',
  headers: {
    'User-Agent': 'Header-Verifier/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}\n`);
  
  const headers = res.headers;
  const requiredHeaders = {
    'strict-transport-security': {
      name: 'Strict-Transport-Security',
      required: true,
      expected: 'max-age=31536000; includeSubDomains; preload'
    },
    'x-frame-options': {
      name: 'X-Frame-Options',
      required: true,
      expected: 'DENY'
    },
    'x-content-type-options': {
      name: 'X-Content-Type-Options',
      required: true,
      expected: 'nosniff'
    },
    'content-security-policy': {
      name: 'Content-Security-Policy',
      required: true,
      expected: 'Contains CSP policy'
    },
    'referrer-policy': {
      name: 'Referrer-Policy',
      required: true,
      expected: 'strict-origin-when-cross-origin'
    },
    'cache-control': {
      name: 'Cache-Control',
      required: false,
      expected: 'Varies by file type'
    }
  };

  console.log('📋 Headers Check:\n');
  console.log('─'.repeat(60));
  
  let allPassed = true;
  let passedCount = 0;
  let missingCount = 0;

  for (const [key, config] of Object.entries(requiredHeaders)) {
    const headerValue = headers[key];
    const status = headerValue ? '✅' : '❌';
    
    if (headerValue) {
      console.log(`${status} ${config.name}`);
      console.log(`   Value: ${headerValue}`);
      if (config.required) {
        passedCount++;
      }
    } else {
      console.log(`${status} ${config.name} - MISSING`);
      if (config.required) {
        missingCount++;
        allPassed = false;
      }
    }
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passedCount}/${Object.keys(requiredHeaders).filter(k => requiredHeaders[k].required).length}`);
  console.log(`   ❌ Missing: ${missingCount}`);
  
  if (allPassed) {
    console.log(`\n✅ All required headers are present!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some required headers are missing. Please check the configuration.`);
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.error(`❌ Error: ${error.message}`);
  console.error('\nPlease check:');
  console.error('  1. Domain is correct');
  console.error('  2. Site is deployed and accessible');
  console.error('  3. HTTPS is working');
  process.exit(1);
});

req.end();

