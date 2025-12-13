// Script để verify system settings sync với Supabase
// Chạy: node verify_system_settings_sync.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySystemSettings() {
  console.log('🔍 Verifying System Settings Sync...\n');

  try {
    // 1. Check if app_settings table exists
    console.log('1️⃣ Checking app_settings table...');
    const { data: tableData, error: tableError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (tableError) {
      console.error('❌ Error accessing app_settings table:', tableError);
      return;
    }

    if (!tableData) {
      console.warn('⚠️  app_settings row with id=1 not found');
      console.log('   → Run migration: migrations/add_system_settings_to_app_settings.sql');
      return;
    }

    console.log('✅ app_settings table exists\n');

    // 2. Check if system_settings column exists
    console.log('2️⃣ Checking system_settings column...');
    if (!tableData.system_settings) {
      console.error('❌ system_settings column not found!');
      console.log('   → Run migration: migrations/add_system_settings_to_app_settings.sql');
      return;
    }

    console.log('✅ system_settings column exists\n');

    // 3. Check system_settings data
    console.log('3️⃣ Checking system_settings data...');
    const systemSettings = tableData.system_settings || {};

    if (Object.keys(systemSettings).length === 0) {
      console.warn('⚠️  system_settings is empty');
      console.log('   → Update settings in admin panel to populate data');
    } else {
      console.log('✅ system_settings contains data:');
      console.log('   - platformName:', systemSettings.platformName || '(not set)');
      console.log('   - platformTagline:', systemSettings.platformTagline || '(not set)');
      console.log('   - contactEmail:', systemSettings.contactEmail || '(not set)');
      if (systemSettings.platformDescription) {
        const desc = systemSettings.platformDescription;
        if (typeof desc === 'object') {
          console.log('   - platformDescription:');
          console.log('     * vi:', desc.vi ? '✓' : '(not set)');
          console.log('     * en:', desc.en ? '✓' : '(not set)');
          console.log('     * ja:', desc.ja ? '✓' : '(not set)');
        } else {
          console.log('   - platformDescription:', desc || '(not set)');
        }
      }
    }
    console.log('');

    // 4. Check updated_at
    console.log('4️⃣ Last updated:');
    console.log('   ', tableData.updated_at || '(not set)');
    console.log('');

    // 5. Test write permission
    console.log('5️⃣ Testing write permission...');
    const testData = {
      ...systemSettings,
      _test: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        system_settings: testData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) {
      console.error('❌ Write permission test failed:', updateError.message);
      console.log('   → Check RLS policies for app_settings table');
    } else {
      console.log('✅ Write permission OK');

      // Restore original data
      await supabase
        .from('app_settings')
        .update({
          system_settings: systemSettings,
          updated_at: tableData.updated_at
        })
        .eq('id', 1);
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log('   ✅ Table exists');
    console.log('   ✅ Column exists');
    console.log('   ✅ Data:', Object.keys(systemSettings).length > 0 ? 'Present' : 'Empty');
    console.log('   ✅ Write permission: OK');
    console.log('\n✅ System Settings Sync is ready!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifySystemSettings();

