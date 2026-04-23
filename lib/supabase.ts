import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Necesitaremos esta clave en .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Faltan credenciales de Supabase. El sistema podría fallar.")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
