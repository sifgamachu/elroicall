import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.115.0';
import { createMediaAccess, membershipActive } from './service.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(createMediaAccess({
  async loadMedia(id) {
    const { data, error } = await admin.from('elroi_media').select('id,status,provider,access,storage_path').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async identify(token) {
    const { data, error } = await admin.auth.getUser(token);
    return error ? null : data.user?.id || null;
  },
  async verifyMembership(userId) {
    const key = Deno.env.get('REVENUECAT_SECRET_KEY');
    if (!key) throw new Error('Store verification is not configured');
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Store verification unavailable');
    return membershipActive(await response.json());
  },
  async signVideo(path) {
    const { data, error } = await admin.storage.from('elroi-media').createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) throw error || new Error('Film unavailable');
    return data.signedUrl;
  },
}));
