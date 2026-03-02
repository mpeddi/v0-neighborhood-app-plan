/**
 * Auth Flow Tester - Tests the complete onboarding flow without browser UI
 * Run with: node scripts/test-auth-flow.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test email
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
let createdUserId = null;

async function log(step, message, status = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  };
  console.log(`${icons[status]} ${step}: ${message}`);
}

async function testAuthFlow() {
  console.log('\n🧪 Starting Auth Flow Test\n');
  console.log(`Testing with email: ${TEST_EMAIL}\n`);

  try {
    // Step 1: Create user via Supabase Auth
    console.log('--- Step 1: User Registration ---');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          phone_number: '',
          is_admin: false
        }
      }
    });

    if (authError) {
      await log('Registration', `Failed: ${authError.message}`, 'error');
      return;
    }

    createdUserId = authData.user?.id;
    await log('Registration', `User created: ${createdUserId}`, 'success');

    // Step 2: Wait for auth trigger to create user profile
    console.log('\n--- Step 2: Auth Trigger Check ---');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for trigger

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', createdUserId)
      .single();

    if (profileError) {
      await log('Profile Creation', `Auth trigger failed: ${profileError.message}`, 'error');
      return;
    }

    await log('Profile Creation', `User profile created`, 'success');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Phone: ${profile.phone_number || '(empty)'}`);
    console.log(`   Residence ID: ${profile.residence_id || '(none)'}`);

    // Step 3: Check residence assignment
    console.log('\n--- Step 3: Residence Assignment ---');
    
    if (!profile.residence_id) {
      await log('Residence Assignment', 'No residence assigned (expected if not whitelisted)', 'warn');
    } else {
      const { data: residence, error: residenceError } = await supabase
        .from('residences')
        .select('*')
        .eq('id', profile.residence_id)
        .single();

      if (residenceError) {
        await log('Residence Lookup', `Failed: ${residenceError.message}`, 'error');
      } else {
        await log('Residence Assignment', `Assigned to: ${residence.address}`, 'success');
        console.log(`   Name: ${residence.last_name}`);
      }
    }

    // Step 4: Test phone number update
    console.log('\n--- Step 4: Phone Number Update ---');
    const testPhone = '(555) 123-4567';

    const { error: updateError } = await supabase
      .from('users')
      .update({ phone_number: testPhone })
      .eq('id', createdUserId);

    if (updateError) {
      await log('Phone Update', `Failed: ${updateError.message}`, 'error');
    } else {
      await log('Phone Update', `Phone set to: ${testPhone}`, 'success');

      // Verify update
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', createdUserId)
        .single();

      if (updatedProfile?.phone_number === testPhone) {
        await log('Phone Verification', `Verified: ${updatedProfile.phone_number}`, 'success');
      } else {
        await log('Phone Verification', `Mismatch: ${updatedProfile?.phone_number}`, 'error');
      }
    }

    // Step 5: Test onboarding logic
    console.log('\n--- Step 5: Onboarding Logic ---');
    
    const { data: finalProfile } = await supabase
      .from('users')
      .select('*, residences(*)')
      .eq('id', createdUserId)
      .single();

    const hasPhone = finalProfile?.phone_number && finalProfile.phone_number.trim() !== '';
    const shouldShowOnboarding = !hasPhone;

    if (shouldShowOnboarding) {
      await log('Onboarding Check', 'Should show onboarding (no phone number yet)', 'info');
    } else {
      await log('Onboarding Check', 'Should redirect to calendar (phone number set)', 'info');
    }

    console.log(`\n   Residence: ${finalProfile?.residences?.address || '(none)'}`);
    console.log(`   Phone: ${finalProfile?.phone_number || '(empty)'}`);
    console.log(`   Show Onboarding: ${shouldShowOnboarding}`);

    // Cleanup
    console.log('\n--- Cleanup ---');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(createdUserId);
    
    if (deleteError) {
      await log('User Deletion', `Note: Manual cleanup may be needed: ${deleteError.message}`, 'warn');
    } else {
      await log('User Deletion', `Test user deleted`, 'success');
    }

    console.log('\n✨ Auth Flow Test Complete\n');

  } catch (error) {
    await log('Unexpected Error', error.message, 'error');
    console.error(error);
  }
}

// Run the test
testAuthFlow().catch(console.error);
