// profile.js - Perfil, cambiar tema, unirse a nuevo condominio
export async function renderProfile(container, user, mode) {
  container.innerHTML = `
    <div class="p-4 pb-20">
      <div class="card">
        <div class="flex items-center gap-4">
          <img src="${user.photoUrl || 'https://via.placeholder.com/80'}" class="w-20 h-20 rounded-full object-cover">
          <div><h2 class="text-xl font-bold">${user.name}</h2><p>${user.email}</p></div>
        </div>
        <div class="mt-4">
          <label class="block">Teléfono</label>
          <input type="tel" id="phone" value="${user.phone || ''}" class="w-full p-2 rounded border">
          <label class="block mt-2">Dirección</label>
          <input type="text" id="address" value="${user.address || ''}" class="w-full p-2 rounded border">
          <button id="updateProfile" class="btn-primary mt-4">Actualizar</button>
        </div>
      </div>
      <div class="card mt-4">
        <h3 class="font-bold">Tema</h3>
        <div class="flex gap-2 mt-2">
          <button data-theme="light" class="theme-btn">☀️ Claro</button>
          <button data-theme="dark" class="theme-btn">🌙 Oscuro</button>
          <button data-theme="liquid" class="theme-btn">💧 Liquid Glass</button>
        </div>
      </div>
      <div class="card mt-4">
        <h3 class="font-bold">Unirse a otro condominio</h3>
        <button id="joinTenantBtn" class="btn-primary w-full">Escanear QR / Ingresar código</button>
      </div>
    </div>
  `;
  // Tema
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.onclick = () => {
      const theme = btn.getAttribute('data-theme');
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    };
  });
  // Unirse a tenant
  document.getElementById('joinTenantBtn').onclick = () => {
    const code = prompt('Código del condominio (o escanea QR)');
    if (code) joinTenant(code);
  };
}

async function joinTenant(code) {
  const res = await fetch('/api/tenants/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ code })
  });
  if (res.ok) alert('Te has unido al nuevo condominio. Recarga la página.');
  else alert('Error al unirse');
}