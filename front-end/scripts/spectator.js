window.onload = () => {
  const socket = io("http://localhost:5001", { transports: ['websocket'] });

  socket.on("connection", (user) => {

  });
}