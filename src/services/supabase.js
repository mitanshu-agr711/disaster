import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables:");
  console.error("SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("SUPABASE_KEY:", supabaseAnonKey ? "✓" : "✗");
  throw new Error(
    "Supabase URL and Anon Key must be set in environment variables."
  );
}

console.log("Supabase configuration:");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseAnonKey ? "✓ Present" : "✗ Missing");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;