import { createClient } from '@supabase/supabase-js';

// Ne jamais importer ce fichier depuis un composant client : la clé service_role
// donne un accès total à la base et ne doit exister que côté serveur
// (Server Components, Server Actions, Route Handlers).
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
