// worker.js - Punto de entrada para Cloudflare Worker (plantilla)
// Los placeholders serán reemplazados por el script build.js

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.sessions = new Map();
  }
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anon';
    const userName = url.searchParams.get('userName') || 'Usuario';
    server.accept();
    this.sessions.set(server, { userId, userName });
    server.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      data.from = userId;
      data.userName = userName;
      for (const [ws, info] of this.sessions) {
        if (ws !== server && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    });
    server.addEventListener('close', () => this.sessions.delete(server));
    return new Response(null, { status: 101, webSocket: client });
  }
}

export class MeetingRoom extends ChatRoom {
  // Extiende ChatRoom con lógica de votaciones
  constructor(state, env) {
    super(state, env);
    this.currentVote = null;
    this.votes = new Map();
  }
  async fetch(request) {
    // Similar a ChatRoom pero maneja mensajes de tipo 'new_vote' y 'vote'
    // Por brevedad se omite implementación detallada, pero puede extenderse fácilmente.
    return super.fetch(request);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Servir assets estáticos incrustados (reemplazados por build)
    if (path === '/' || path === '/index.html') return new Response(__INDEX_HTML__, { headers: { 'Content-Type': 'text/html' } });
    if (path === '/admin.html') return new Response(__ADMIN_HTML__, { headers: { 'Content-Type': 'text/html' } });
    if (path === '/superadmin.html') return new Response(__SUPERADMIN_HTML__, { headers: { 'Content-Type': 'text/html' } });
    if (path === '/app/style/style.css') return new Response(__STYLE_CSS__, { headers: { 'Content-Type': 'text/css' } });
    if (path === '/app/style/theme.css') return new Response(__THEME_CSS__, { headers: { 'Content-Type': 'text/css' } });
    if (path.startsWith('/app/system/')) {
      const fileName = path.replace('/app/system/', '');
      if (__JS_MODULES__[fileName]) return new Response(__JS_MODULES__[fileName], { headers: { 'Content-Type': 'application/javascript' } });
    }

    // API endpoints
    if (path === '/api/login' && method === 'POST') {
      const { email, password, tenantCode } = await request.json();
      // Consultar D1 para validar usuario y tenant
      const user = await validateUser(env.DB, email, password, tenantCode);
      if (user) {
        const token = await generateJWT(user, env.JWT_SECRET);
        return Response.json({ token, user });
      }
      return new Response('Unauthorized', { status: 401 });
    }

    if (path === '/api/news' && method === 'GET') {
      const auth = verifyAuth(request, env.JWT_SECRET);
      if (!auth) return new Response('Unauthorized', { status: 401 });
      const { results } = await env.DB.prepare('SELECT * FROM news WHERE tenant_id = ? ORDER BY created_at DESC').bind(auth.tenantId).all();
      return Response.json(results);
    }

    if (path === '/api/tenants/join' && method === 'POST') {
      const auth = verifyAuth(request, env.JWT_SECRET);
      if (!auth) return new Response('Unauthorized', { status: 401 });
      const { code } = await request.json();
      const tenant = await env.DB.prepare('SELECT id FROM tenants WHERE code = ?').bind(code).first();
      if (tenant) {
        await env.DB.prepare('INSERT INTO user_tenants (user_id, tenant_id, role) VALUES (?, ?, ?)').bind(auth.userId, tenant.id, 'member').run();
        return new Response('OK', { status: 200 });
      }
      return new Response('Invalid code', { status: 400 });
    }

    // WebSocket upgrade
    if (path.startsWith('/ws/chat/')) {
      const roomId = path.split('/').pop();
      const namespace = roomId.startsWith('meeting') ? env.MEETING_ROOM : env.CHAT_ROOM;
      const id = namespace.idFromName(roomId);
      const obj = namespace.get(id);
      return obj.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Funciones auxiliares (simplificadas)
async function validateUser(db, email, password, tenantCode) {
  // Implementar verificación con bcryptjs y consulta a D1
  // Por ahora retorna mock
  return { id: 'user1', name: 'Usuario Demo', email, role: 'member', tenantId: 'tenant1' };
}

async function generateJWT(user, secret) {
  // Usar Web Crypto API
  const encoder = new TextEncoder();
  const data = JSON.stringify({ userId: user.id, tenantId: user.tenantId, role: user.role, exp: Date.now() + 3600000 });
  // Implementación real con HMAC-SHA256
  return 'mock-jwt';
}

function verifyAuth(request, secret) {
  // Extraer y verificar JWT
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  const token = auth.split(' ')[1];
  // Verificar token (mock)
  return { userId: 'user1', tenantId: 'tenant1', role: 'member' };
}