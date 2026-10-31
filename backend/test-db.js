require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('colleges').select('*').limit(1);
    if (error) {
      console.log("Supabase connection notice (Normal if tables are not created yet):", error.message);
    } else {
      console.log("Connected to Supabase successfully! Data:", data);
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

testConnection();