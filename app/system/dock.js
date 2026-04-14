// dock.js - Barra inferior fija con navegación
export function renderDock(mode) {
  const existing = document.querySelector('.dock');
  if (existing) existing.remove();

  const dock = document.createElement('div');
  dock.className = 'dock';
  let items = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/comunidad', icon: '💬', label: 'Comunidad' },
    { path: '/perfil', icon: '👤', label: 'Perfil' }
  ];
  if (mode === 'admin') {
    items.push({ path: '/admin', icon: '⚙️', label: 'Admin' });
  } else if (mode === 'superadmin') {
    items.push({ path: '/superadmin', icon: '🌐', label: 'Tenants' });
  }
  dock.innerHTML = items.map(item => `
    <a href="${item.path}" class="dock-item" data-link>
      <span class="dock-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');
  document.body.appendChild(dock);

  document.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });
}