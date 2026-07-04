import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import postgres from "npm:postgres";
import * as kv from "./kv_store.tsx";

// Auto-repair KV table if it was deleted
try {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (dbUrl) {
    const sql = postgres(dbUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store_c537a8c8 (
        key TEXT NOT NULL PRIMARY KEY,
        value JSONB NOT NULL
      );
    `;
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("KV table checked/created and schema cache reloaded.");
    await sql.end();
  }
} catch (err) {
  console.error("Failed to ensure KV table exists:", err);
}

// Ensure bucket exists
try {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const bucketName = 'make-c537a8c8-uploads';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log("Storage bucket created.");
    }
  }
} catch (err) {
  console.error("Failed to ensure Storage bucket exists:", err);
}

const app = new Hono();
app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const ROUTE_PREFIX = "/make-server-c537a8c8";

app.get(`${ROUTE_PREFIX}/health`, (c) => {
  return c.json({ status: "ok" });
});

// GET all properties
app.get(`${ROUTE_PREFIX}/properties`, async (c) => {
  try {
    const properties = await kv.getByPrefix("property:");
    return c.json(properties);
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return c.json({ error: error.message }, 500);
  }
});

// GET property by id
app.get(`${ROUTE_PREFIX}/properties/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const property = await kv.get(`property:${id}`);
    if (!property) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json(property);
  } catch (error: any) {
    console.error("Error fetching property:", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST new property
app.post(`${ROUTE_PREFIX}/properties`, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const property = { ...body, id, createdAt: new Date().toISOString() };
    await kv.set(`property:${id}`, property);
    return c.json(property, 201);
  } catch (error: any) {
    console.error("Error creating property:", error);
    return c.json({ error: error.message }, 500);
  }
});

// PUT update property
app.put(`${ROUTE_PREFIX}/properties/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`property:${id}`);
    if (!existing) {
      return c.json({ error: 'Not found' }, 404);
    }
    const updated = { ...existing, ...body, id };
    await kv.set(`property:${id}`, updated);
    return c.json(updated);
  } catch (error: any) {
    console.error("Error updating property:", error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE property
app.delete(`${ROUTE_PREFIX}/properties/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`property:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return c.json({ error: error.message }, 500);
  }
});

// GET property history
app.get(`${ROUTE_PREFIX}/properties/:id/history`, async (c) => {
  try {
    const id = c.req.param('id');
    const history = await kv.getByPrefix(`property_history:${id}:`);
    
    // Sort descending by createdAt
    const sorted = history.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return c.json(sorted);
  } catch (error: any) {
    console.error("Error fetching history:", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST property history
app.post(`${ROUTE_PREFIX}/properties/:id/history`, async (c) => {
  try {
    const propertyId = c.req.param('id');
    const body = await c.req.json();
    const historyId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const historyEntry = { 
      id: historyId,
      property_id: propertyId,
      ...body, 
      created_at: createdAt 
    };
    
    await kv.set(`property_history:${propertyId}:${createdAt}-${historyId}`, historyEntry);
    return c.json(historyEntry, 201);
  } catch (error: any) {
    console.error("Error adding history:", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST signup
app.post(`${ROUTE_PREFIX}/signup`, async (c) => {
  try {
    const { email, password, name, agency, role, status } = await c.req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return c.json({ error: 'Server configuration missing' }, 500);
    }

    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, agency, role, status },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: name || 'Administrador do Sistema',
        agency: agency || 'Admin',
        role: role || 'Admin',
        status: status || 'Ativo'
      };
      await kv.set(`user:${data.user.id}`, user);
      return c.json(user, 201);
    }
    
    return c.json({ error: 'User creation failed' }, 500);
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return c.json({ error: error.message }, 500);
  }
});

// GET all users
app.get(`${ROUTE_PREFIX}/users`, async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST user
app.post(`${ROUTE_PREFIX}/users`, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const user = { ...body, id };
    await kv.set(`user:${id}`, user);
    return c.json(user, 201);
  } catch (error: any) {
    console.error("Error creating user:", error);
    return c.json({ error: error.message }, 500);
  }
});

// PUT update user
app.put(`${ROUTE_PREFIX}/users/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`user:${id}`) || {};
    const updated = { ...existing, ...body, id };
    await kv.set(`user:${id}`, updated);
    
    // Attempt to also update Supabase Auth User Metadata if possible
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseServiceKey) {
        const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey);
        await adminAuthClient.auth.admin.updateUserById(id, {
          user_metadata: {
            name: updated.name,
            agency: updated.agency,
            role: updated.role,
            status: updated.status
          }
        });
      }
    } catch (e) {
      console.error("Failed to update auth metadata", e);
    }

    return c.json(updated);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE user
app.delete(`${ROUTE_PREFIX}/users/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`user:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST upload file
app.post(`${ROUTE_PREFIX}/upload`, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return c.json({ error: 'Server configuration missing' }, 500);
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('make-c537a8c8-uploads')
      .upload(fileName, file, { contentType: file.type });
      
    if (error) {
      throw error;
    }
    
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('make-c537a8c8-uploads')
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);
      
    if (signedUrlError) {
      throw signedUrlError;
    }
    
    return c.json({ url: signedUrlData.signedUrl });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);