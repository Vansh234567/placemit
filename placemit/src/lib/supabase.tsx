// lib/supabase.ts
// Browser client — use in Client Components
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Allowed email domain
export const ALLOWED_DOMAIN = 'learner.manipal.edu'

export const BRANCHES = [
  'CSE', 'ECE', 'MECH', 'EEE', 'CIVIL', 'IT',
  'AI/ML', 'VLSI', 'MnC', 'CSFT', 'CCE'
]

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
