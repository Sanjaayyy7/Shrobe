// Script to create a test user in Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://hviofamhcgqukpenyjjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW9mYW1oY2dxdWtwZW55amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTEwNjksImV4cCI6MjA2MTE4NzA2OX0.NA8gvvyKVlhAsdcM2f6mWCCYzTE5aD7WsTZateBNGMk';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test user credentials - for demonstration only
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
};

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });
    
    if (error) {
      console.error('Error creating test user:', error.message);
      return;
    }
    
    console.log('Test user created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('\nYou can now log in with these credentials.');
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createTestUser(); 