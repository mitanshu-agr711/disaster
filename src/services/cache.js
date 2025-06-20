import supabase from "./supabase.js";

const  getCache=async(key)=> {
  const { data } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', key)
    .single();
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return data.value;
}

const  setCache=async(key, value, ttlSeconds)=> {
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await supabase
    .from('cache')
    .upsert([{ key, value, expires_at }], { onConflict: 'key' });
}

export {
  getCache,
  setCache,
};
