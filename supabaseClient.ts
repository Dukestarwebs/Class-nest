
import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnvVar = (key: string): string => {
  // 1. Try process.env (Node/Webpack/Environment shim)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // 2. Try import.meta.env (Vite) safely using optional chaining
  // @ts-ignore
  const val = (import.meta as any)?.env?.[key];
  return val || '';
};

// Configuration provided for the application
const SUPABASE_URL = 'https://qhkqktorsizzgghiacxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa3FrdG9yc2l6emdnaGlhY3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjI5NDQsImV4cCI6MjA3OTQ5ODk0NH0.IejTYnzBtstPBztDlSTdAwPXf3IWtWL8VeOBlsdpuoM';

// Use environment variables if present, otherwise fall back to the provided configuration
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || SUPABASE_URL;
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
