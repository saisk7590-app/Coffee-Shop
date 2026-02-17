import "react-native-url-polyfill/auto";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pybtqdwtjhoduwmodnhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnRxZHd0amhvZHV3bW9kbmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NzE4MTYsImV4cCI6MjA4NjQ0NzgxNn0.rXCsAvxtydemUcO7UQMfH7RzSesaZhbx814qbOfQzvY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
