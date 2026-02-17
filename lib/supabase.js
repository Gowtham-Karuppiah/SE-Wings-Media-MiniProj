import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hfzlguiebfrixpkhgqpp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmemxndWllYmZyaXhwa2hncXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODg5NDIsImV4cCI6MjA3Nzk2NDk0Mn0.HEhT-kgiCuSOa2mAkY1xzf8iWxJwakaqVt41dlwoizg"

export const supabase = createClient(supabaseUrl, supabaseKey)
