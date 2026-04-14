// api.js - Funciones para manejar token y usuario actual
export function getCurrentUser() {
  const str = localStorage.getItem('user');
  return str ? JSON.parse(str) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}