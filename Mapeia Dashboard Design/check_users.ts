import * as kv from './supabase/functions/server/kv_store.js';

async function check() {
  try {
    const users = await kv.getByPrefix('user:');
    console.log("Users in KV:", users);
  } catch (e) {
    console.error(e);
  }
}
check();