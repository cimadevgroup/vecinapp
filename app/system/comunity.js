// comunity.js - Chat general y salas de reunión con votaciones
import { initChat } from './websocket.js';

export async function renderComunity(container, user, mode) {
  container.innerHTML = `
    <div class="chat-container">
      <div class="bg-white/20 p-2 flex gap-2">
        <button id="btnGeneral" class="flex-1 py-1 rounded bg-blue-500 text-white">Chat General</button>
        <button id="btnMeeting" class="flex-1 py-1 rounded bg-gray-500 text-white">Reunión Activa</button>
      </div>
      <div class="messages" id="chatMessages"></div>
      <div class="message-input">
        <input type="text" id="msgInput" placeholder="Escribe un mensaje..." class="flex-1 p-2 rounded-l bg-white/50">
        <button id="sendBtn" class="bg-blue-500 text-white px-4 rounded-r">Enviar</button>
      </div>
      <div id="votingPanel" class="p-2 hidden"></div>
    </div>
  `;
  
  const tenantId = user.tenantId;
  let currentRoom = `general_${tenantId}`;
  let ws = initChat(currentRoom, user.id, user.name, (msg) => addMessage(msg));
  
  document.getElementById('btnGeneral').onclick = () => {
    if (ws) ws.close();
    currentRoom = `general_${tenantId}`;
    ws = initChat(currentRoom, user.id, user.name, addMessage);
    document.getElementById('votingPanel').classList.add('hidden');
  };
  document.getElementById('btnMeeting').onclick = () => {
    if (ws) ws.close();
    currentRoom = `meeting_${tenantId}`;
    ws = initChat(currentRoom, user.id, user.name, addMessage);
    if (user.role === 'board') showVotingControls();
    else document.getElementById('votingPanel').classList.remove('hidden');
  };
  document.getElementById('sendBtn').onclick = () => {
    const input = document.getElementById('msgInput');
    if (input.value.trim()) ws.send(JSON.stringify({ type: 'message', content: input.value }));
    input.value = '';
  };
}

function addMessage(msg) {
  const div = document.createElement('div');
  div.className = `message ${msg.isOwn ? 'own' : ''}`;
  div.innerHTML = `<strong>${msg.userName}:</strong> ${msg.content}`;
  document.getElementById('chatMessages').appendChild(div);
  div.scrollIntoView();
}

function showVotingControls() {
  const panel = document.getElementById('votingPanel');
  panel.innerHTML = `
    <button id="newVoteBtn" class="bg-green-500 text-white p-2 rounded w-full">Crear votación</button>
    <div id="voteResults"></div>
  `;
  panel.classList.remove('hidden');
  document.getElementById('newVoteBtn').onclick = () => {
    const question = prompt('Pregunta de la votación');
    if (question) {
      // Enviar vía WebSocket al Durable Object MeetingRoom
      ws.send(JSON.stringify({ type: 'new_vote', question, options: ['Sí', 'No', 'Abstención'] }));
    }
  };
}