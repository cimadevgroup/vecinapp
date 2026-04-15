// api.js - Configuración de endpoints
// Cambia esta URL por la de tu Worker de Cloudflare cuando esté desplegado
export const API_BASE = 'https://tu-worker.workers.dev'; // ← pon tu URL real

export function getCurrentUser() { ... }
export async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  return res.json();
}
