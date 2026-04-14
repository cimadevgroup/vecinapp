// home.js - Pantalla de inicio: noticias, redes, finanzas
export async function renderHome(container, user, mode) {
  container.innerHTML = `
    <div class="p-4 pb-20">
      <h1 class="text-2xl font-bold mb-4">🏠 Novedades</h1>
      <div id="newsList" class="space-y-4"></div>
      <div class="mt-6 card">
        <h2 class="font-bold">📱 Redes sociales</h2>
        <div id="socialLinks" class="flex gap-4 mt-2"></div>
      </div>
      <div class="mt-6 card">
        <h2 class="font-bold">💰 Finanzas transparentes</h2>
        <canvas id="financesChart" width="300" height="150" class="w-full"></canvas>
      </div>
    </div>
  `;
  // Cargar noticias desde API
  const news = await fetchAPI('/api/news');
  const newsDiv = document.getElementById('newsList');
  news.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3 class="font-semibold">${item.title}</h3><p>${item.content}</p>`;
    newsDiv.appendChild(card);
  });
  // Cargar enlaces sociales
  const social = await fetchAPI('/api/social');
  const socialDiv = document.getElementById('socialLinks');
  socialDiv.innerHTML = Object.entries(social).map(([name, url]) => `<a href="${url}" target="_blank" class="text-blue-500">${name}</a>`).join('');
  // Mostrar finanzas (mock)
  const ctx = document.getElementById('financesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Ene', 'Feb', 'Mar'], datasets: [{ label: 'Ingresos', data: [1200, 1350, 1400] }] }
  });
}

async function fetchAPI(endpoint) {
  const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return res.json();
}