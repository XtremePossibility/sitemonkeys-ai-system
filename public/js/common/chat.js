// Example: Client-side chat logic
let toggle = true;

function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  const box = document.getElementById('chat-box');
  const bubble = document.createElement('div');
  const isRoxy = toggle;
  const who = isRoxy ? 'Roxy' : 'Eli';
  const avatar = isRoxy ? 'girl-mascot.png' : 'boy-mascot.png';
  const bubbleClass = isRoxy ? 'bubble roxy' : 'bubble eli';

  bubble.className = bubbleClass;
  bubble.innerHTML = `
    <img src="${avatar}" class="avatar" />
    <div class="bubble-content"><strong>${who}:</strong> ${text}</div>
  `;

  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  input.value = '';
  toggle = !toggle;
}
