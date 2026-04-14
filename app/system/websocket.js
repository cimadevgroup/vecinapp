// websocket.js - Manejo de conexión WebSocket a salas
export function initChat(roomId, userId, userName, onMessage) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/chat/${roomId}?userId=${userId}&userName=${encodeURIComponent(userName)}`;
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => console.log('Conectado a sala', roomId);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage({ ...data, isOwn: data.from === userId });
  };
  ws.onerror = (err) => console.error('WebSocket error', err);
  return ws;
}