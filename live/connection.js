const Router = require("express-promise-router");
require("dotenv").config();
var nodeCleanup = require('node-cleanup');

const router = new Router();

let timerList = [];

/**
 * cleans up timers before node process is ended
 */
nodeCleanup(() => {
  timerList.forEach(t => {
    clearInterval(t);
  })
});

module.exports = (io, ds) => {
  const { getAllStockPrices } = ds;

  
  console.log("Emitting prices");
  const timer = setInterval(() => {
    getAllStockPrices().then((stocks) => {
    stocks.forEach((price, ticker) => {
        io.in(ticker).emit("livePrices", { ticker, price });
      });
    });
  }, 1500);
  timerList.push(timer);

  io.on("connection", (socket) => {
    socket.emit("Hello", "World");

    socket.on("subscribe", (tickers) => {
      console.log("joining", tickers);
      socket.join(tickers);
    });
  });

  return router;
};

