#!/usr/bin/env node

/**
 * Auth Flow Tester - Tests the complete onboarding flow without browser UI
 * This script:
 * 1. Creates a test user via Supabase Auth
 * 2. Verifies the user profile was created by the auth trigger
 * 3. Checks residence assignment from whitelist
 * 4. Tests phone number updates
 * 5. Reports the full flow status
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[TEST] Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAuthFlow() {
  const testEmail = `test-${Date.now()}@neighborhood.local`;
  const testPassword = 'TestPassword123!@#';
  const testPhone = '(555) 123-4567';
  
  console.log('\n========== Auth Flow Tester ==========');
  console.log(`[TEST] Starting auth flow test with email: ${testEmail}\n`);

  try {
    // Step 1: Create test user
    console.log('[TEST] Step 1: Creating new user...');
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (signUpError || !authData.user) {
      throw new Error(`Failed to create user: ${signUpError?.message}`);
    }

    const userId = authData.user.id;
    console.log(`[TEST] ✓ User created with ID: ${userId}`);

    // Step 2: Wait for auth trigger to create profile
    console.log('\n[TEST] Step 2: Checking if user profile was created by auth trigger...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s for trigger

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*,residences(*)')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Profile not found: ${profileError.message}`);
    }

    console.log(`[TEST] ✓ User profile created`);
    console.log(`      - Email: ${userProfile.email}`);
    console.log(`      - Is Admin: ${userProfile.is_admin}`);
    console.log(`      - Residence ID: ${userProfile.residence_id || 'NOT SET'}`);
    console.log(`      - Has Residence Data: ${!!userProfile.residences}`);

    // Step 3: Verify residence assignment (if any)
    if (userProfile.residences) {
      console.log(`      - Residence Address: ${userProfile.residences.address}`);
      console.log(`      - Residence Name: ${userProfile.residences.last_name}`);
    }

    // Step 4: Test phone number update
    console.log(`\n[TEST] Step 3: Testing phone number update...`);
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ phone_number: testPhone })
      .eq('id', userId)
      .select();

    if (updateError) {
      throw new Error(`Failed to update phone: ${updateError.message}`);
    }

    console.log(`[TEST] ✓ Phone number updated to: ${testPhone}`);

    // Step 5: Verify phone was saved
    console.log(`\n[TEST] Step 4: Verifying phone number was saved...`);
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (verifyError) {
      throw new Error(`Failed to verify phone: ${verifyError.message}`);
    }

    if (verifyProfile.phone_number === testPhone) {
      console.log(`[TEST] ✓ Phone number verified: ${verifyProfile.phone_number}`);
    } else {
      throw new Error(`Phone number mismatch. Expected: ${testPhone}, Got: ${verifyProfile.phone_number}`);
    }

    // Step 6: Check onboarding logic
    console.log(`\n[TEST] Step 5: Checking onboarding logic...`);
    const hasPhone = verifyProfile.phone_number && verifyProfile.phone_number.trim() !== '';
    if (hasPhone) {
      console.log(`[TEST] ✓ User would be redirected to calendar (phone is set)`);
    } else {
      console.log(`[TEST] ✓ User would see onboarding screen (phone not set)`);
    }

    // Clean up
    console.log(`\n[TEST] Step 6: Cleaning up test user...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.warn(`[TEST] ⚠ Warning: Could not delete test user: ${deleteError.message}`);
    } else {
      console.log(`[TEST] ✓ Test user deleted`);
    }

    console.log('\n[TEST] ========== Auth Flow Test PASSED ==========\n');
    return true;

  } catch (err) {
    console.error(`\n[TEST] ✗ Auth Flow Test FAILED:`);
    console.error(`[TEST] ${err.message}\n`);
    return false;
  }
}

testAuthFlow().then(success => {
  process.exit(success ? 0 : 1);
});
