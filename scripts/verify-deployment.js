#!/usr/bin/env node

/**
 * Script để verify project sẵn sàng deploy lên Vercel
 * Chạy: node scripts/verify-deployment.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const checks = [];
let hasErrors = false;

function check(name, condition, errorMsg) {
  if (condition) {
    checks.push({ name, status: '✅', message: 'OK' });
  } else {
    checks.push({ name, status: '❌', message: errorMsg });
    hasErrors = true;
  }
}

console.log('🔍 Verifying project for Vercel deployment...\n');

// Check 1: vercel.json exists
const vercelJsonPath = join(rootDir, 'vercel.json');
check(
  'vercel.json exists',
  existsSync(vercelJsonPath),
  'File vercel.json not found. Run: echo \'{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}\' > vercel.json'
);

if (existsSync(vercelJsonPath)) {
  try {
    const vercelJson = JSON.parse(readFileSync(vercelJsonPath, 'utf-8'));
    check(
      'vercel.json has rewrites',
      vercelJson.rewrites && Array.isArray(vercelJson.rewrites),
      'vercel.json missing rewrites array'
    );
  } catch (e) {
    check('vercel.json is valid JSON', false, `Invalid JSON: ${e.message}`);
  }
}

// Check 2: package.json exists and has build script
const packageJsonPath = join(rootDir, 'package.json');
check(
  'package.json exists',
  existsSync(packageJsonPath),
  'package.json not found'
);

if (existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    check(
      'package.json has build script',
      packageJson.scripts && packageJson.scripts.build,
      'package.json missing build script'
    );
    
    if (packageJson.scripts && packageJson.scripts.build) {
      const buildCmd = packageJson.scripts.build;
      check(
        'build script uses vite build',
        buildCmd.includes('vite build'),
        `Build script should use 'vite build', found: ${buildCmd}`
      );
    }
  } catch (e) {
    check('package.json is valid JSON', false, `Invalid JSON: ${e.message}`);
  }
}

// Check 3: vite.config.js exists
const viteConfigPath = join(rootDir, 'vite.config.js');
check(
  'vite.config.js exists',
  existsSync(viteConfigPath),
  'vite.config.js not found'
);

// Check 4: src directory exists
const srcDir = join(rootDir, 'src');
check(
  'src directory exists',
  existsSync(srcDir),
  'src directory not found'
);

// Check 5: public/_redirects exists (optional, for Netlify)
const redirectsPath = join(rootDir, 'public', '_redirects');
if (existsSync(redirectsPath)) {
  checks.push({ 
    name: 'public/_redirects exists', 
    status: 'ℹ️', 
    message: 'Found (for Netlify, not needed for Vercel)' 
  });
}

// Display results
console.log('📋 Verification Results:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});

console.log('\n' + '='.repeat(50) + '\n');

if (hasErrors) {
  console.log('❌ Some checks failed. Please fix the errors above before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Project is ready for Vercel deployment.\n');
  console.log('📚 Next steps:');
  console.log('   1. Read: docs/deployment/DEPLOY_TO_VERCEL_STEP_BY_STEP.md');
  console.log('   2. Follow the step-by-step guide');
  console.log('   3. Deploy to Vercel!\n');
  process.exit(0);
}

