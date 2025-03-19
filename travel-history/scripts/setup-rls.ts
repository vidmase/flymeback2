import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kayyrfpijdeqfrmylecj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtheXlyZnBpamRlcWZybXlsZWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjMwOTUsImV4cCI6MjA1NTk5OTA5NX0.LCxdJ15nI8lxDd5BX8DvxH8Cg1MQhljckzvXZFCZn7c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRLS() {
  try {
    // Create a policy to allow all operations
    const { data, error } = await supabase.rpc('create_airports_policy');

    if (error) {
      console.error('Error creating policy:', error);
    } else {
      console.log('Successfully created policy');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

setupRLS(); 