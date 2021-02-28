const Router = require("express-promise-router");
require("dotenv").config();
var nodeCleanup = require('node-cleanup');

const router = new Router();

let timerList = [];

/**
 * cleans up timers before node process in ended
 */
nodeCleanup(() => {
  timerList.forEach(t => {
    clearInterval(t);
  })
});

module.exports = (io, ds) => {
  const { getAllStockPrices } = ds;

  
  const timer = setInterval(() => {
    getAllStockPrices().then((stocks) => {
    stocks.forEach((price, ticker) => {
        console.log("emitting ", price, " to ", ticker);
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

