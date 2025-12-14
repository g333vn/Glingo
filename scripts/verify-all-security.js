#!/usr/bin/env node

/**
 * Script to verify ALL security configurations
 * Usage: node scripts/verify-all-security.js <domain>
 * Example: node scripts/verify-all-security.js https://glingo.vercel.app
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const domain = process.argv[2] || 'https://glingo.vercel.app';

console.log('🔒 Verifying All Security Configurations\n');
console.log(`Domain: ${domain}\n`);
console.log('='.repeat(60));
console.log('');

async function runScript(scriptName, description) {
  console.log(`\n📋 ${description}`);
  console.log('-'.repeat(60));
  
  try {
    const { stdout, stderr } = await execAsync(`npm run ${scriptName} -- ${domain}`);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

async function verifyAll() {
  const results = [];
  
  // 1. Verify Security Headers
  results.push(await runScript('verify:headers', '1. Security Headers'));
  
  // Small delay between requests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Verify Cache-Control Headers
  results.push(await runScript('verify:cache', '2. Cache-Control Headers'));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Final Summary:\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   ✅ Passed: ${passed}/${results.length}`);
  console.log(`   ❌ Failed: ${failed}/${results.length}`);
  
  if (failed === 0) {
    console.log(`\n✅ All security verifications passed!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Re-run ZAP scan to confirm fixes`);
    console.log(`   2. Monitor security headers in production`);
    console.log(`   3. Review CSP policy if needed (currently uses unsafe-inline/eval for React)`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some verifications failed. Please check the output above.`);
    console.log(`\n💡 Common issues:`);
    console.log(`   - Cache-Control headers not added via Vercel Dashboard`);
    console.log(`   - Headers not yet deployed (wait 1-2 minutes after adding)`);
    console.log(`   - Domain not accessible`);
    process.exit(1);
  }
}

verifyAll().catch(console.error);

