require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ksskokjrdzqghhuahjpl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized:', supabaseUrl);

module.exports = { supabase };
