const io = require("socket.io-client");

const clientSocket = io(`http://localhost:3000`);
clientSocket.on("connect", () => {
  clientSocket.emit("subscribe", ["GME", "TSLA"]);
});

clientSocket.on("Hello", (message) => {
  console.log('Hello', message);
});

clientSocket.on("livePrices", prices => {
  console.log(prices);
})

clientSocket.on("disconnect", () => {
  console.log('client disconnected');
})