socket = new WebSocket("wss://server-8lea.onrender.com");
// Khi kết nối WebSocket được mở
socket.addEventListener('open', () => {
  console.log('Connected to the server');
});

// Khi nhận được tin nhắn từ server
socket.addEventListener('message', (event) => {
  const messagesDiv = document.getElementById('messages');
  const message = document.createElement('p');
  message.textContent = `Received: ${event.data}`;
  messagesDiv.appendChild(message);
});

// Khi bấm nút Request Screenshot
document.getElementById('screenshotBtn').addEventListener('click', () => {
  const message = JSON.stringify({ type: 'screenshot' });
  socket.send(message);
  console.log(`Sent: ${message}`);
});

// Khi bấm nút Send Click
document.getElementById('clickBtn').addEventListener('click', () => {
  const text = document.getElementById('clickTextInput').value;
  const message = JSON.stringify({ type: 'click', data: { text } });
  socket.send(message);
  console.log(`Sent: ${message}`);
});

// Khi bấm nút Send Fill
document.getElementById('fillBtn').addEventListener('click', () => {
  const hintText = document.getElementById('hintTextInput').value;
  const fillText = document.getElementById('fillTextInput').value;
  const message = JSON.stringify({ type: 'fill', data: { hintText, text: fillText } });
  socket.send(message);
  console.log(`Sent: ${message}`);
});

// Khi bấm nút Send Open
document.getElementById('openBtn').addEventListener('click', () => {
  const text = document.getElementById('openTextInput').value;
  const message = JSON.stringify({ type: 'open', data: { text } });
  socket.send(message);
  console.log(`Sent: ${message}`);
});

// Khi bấm nút Send Dump
document.getElementById('dumpBtn').addEventListener('click', () => {
  const message = JSON.stringify({ type: 'dump' });
  socket.send(message);
  console.log(`Sent: ${message}`);
});

// Khi WebSocket đóng kết nối
socket.addEventListener('close', () => {
  console.log('Disconnected from server');
});