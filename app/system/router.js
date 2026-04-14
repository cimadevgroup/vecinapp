// router.js - Enrutador SPA, carga dinámica de vistas
import { renderHome } from './home.js';
import { renderComunity } from './comunity.js';
import { renderProfile } from './profile.js';
import { renderDock } from './dock.js';
import { getCurrentUser, isAuthenticated } from './api.js';

let rootElement = null;

export async function initRouter() {
  rootElement = document.getElementById('app');
  // Verificar autenticación (token en localStorage)
  if (!isAuthenticated() && window.location.pathname !== '/login') {
    showLogin();
    return;
  }
  window.addEventListener('popstate', () => renderRoute(window.location.pathname));
  renderRoute(window.location.pathname);
}

async function renderRoute(path) {
  if (!rootElement) return;
  const user = getCurrentUser();
  const mode = window.__APP_MODE__ || 'member';

  if (path === '/' || path === '/home') {
    await renderHome(rootElement, user, mode);
  } else if (path === '/comunidad') {
    await renderComunity(rootElement, user, mode);
  } else if (path === '/perfil') {
    await renderProfile(rootElement, user, mode);
  } else if (path === '/admin' && (mode === 'admin' || user?.role === 'board')) {
    await renderAdminPanel(rootElement, user);
  } else {
    await renderHome(rootElement, user, mode);
  }
  renderDock(mode);
}

function showLogin() {
  rootElement.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="card w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Iniciar sesión</h2>
        <input type="email" id="email" placeholder="Email" class="w-full p-2 mb-2 rounded border">
        <input type="password" id="password" placeholder="Contraseña" class="w-full p-2 mb-2 rounded border">
        <input type="text" id="tenantCode" placeholder="Código del condominio" class="w-full p-2 mb-4 rounded border">
        <button id="loginBtn" class="btn-primary w-full">Entrar</button>
        <p class="mt-4 text-center text-sm">¿No tienes código? Escanea el QR de tu comunidad</p>
        <button id="scanQrBtn" class="mt-2 text-blue-500">Escanear QR</button>
      </div>
    </div>
  `;
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const tenantCode = document.getElementById('tenantCode').value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantCode })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } else {
      alert('Credenciales incorrectas');
    }
  });
  // Escaneo QR (usando librería opcional)
  document.getElementById('scanQrBtn').addEventListener('click', () => {
    alert('Implementa html5-qrcode para escanear');
  });
}