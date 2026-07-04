import { Property, PropertyHistory, AppUser } from '../types';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from './supabase';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c537a8c8`;

// Helper for authorized fetch
async function authFetch(path: string, options: RequestInit = {}) {
  // Get the access token from the active session if available
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || publicAnonKey;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let msg = 'API error';
    try {
      const errBody = await res.json();
      msg = errBody.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Properties ───────────────────────────────────────────────────────────────

export async function getProperties(): Promise<Property[]> {
  return authFetch('/properties');
}

export async function getProperty(id: string): Promise<Property> {
  return authFetch(`/properties/${id}`);
}

export async function createProperty(property: Partial<Property>): Promise<Property> {
  return authFetch('/properties', {
    method: 'POST',
    body: JSON.stringify(property),
  });
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<Property> {
  return authFetch(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(property),
  });
}

export async function deleteProperty(id: string): Promise<void> {
  await authFetch(`/properties/${id}`, { method: 'DELETE' });
}

// ── History ───────────────────────────────────────────────────────────────────

export async function getPropertyHistory(propertyId: string): Promise<PropertyHistory[]> {
  return authFetch(`/properties/${propertyId}/history`);
}

export async function addPropertyHistory(propertyId: string, payload: { action: string; author: string; agency?: string }): Promise<PropertyHistory> {
  return authFetch(`/properties/${propertyId}/history`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AppUser[]> {
  return authFetch('/users');
}

export async function createUser(payload: Omit<AppUser, 'id'> | AppUser): Promise<AppUser> {
  return authFetch('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string, payload: Partial<AppUser>): Promise<AppUser> {
  return authFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await authFetch(`/users/${id}`, { method: 'DELETE' });
}

export async function signupAdmin(payload: any): Promise<AppUser> {
  return authFetch('/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── File Upload ───────────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || publicAnonKey;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let msg = 'Upload failed';
    try {
      const errBody = await res.json();
      msg = errBody.error || msg;
    } catch {}
    throw new Error(msg);
  }
  
  const result = await res.json();
  return result.url;
}