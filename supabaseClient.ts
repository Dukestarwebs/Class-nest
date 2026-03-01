import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to ensure stability across all environments and fix the undefined property crash
const supabaseUrl = 'https://qhkqktorsizzgghiacxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa3FrdG9yc2l6emdnaGlhY3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjI5NDQsImV4cCI6MjA3OTQ5ODk0NH0.IejTYnzBtstPBztDlSTdAwPXf3IWtWL8VeOBlsdpuoM';

export const supabase = createClient(supabaseUrl, supabaseKey);