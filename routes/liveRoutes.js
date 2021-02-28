const Router = require("express-promise-router");
require("dotenv").config();

const router = new Router();

// const { ErrorHandler } = require("../helpers/errorsHelper");

module.exports = (io, ds) => {
  const { getAllStockPrices } = ds;

  let timerList = [];
  
  const timer = setInterval(() => {
    getAllStockPrices().then((stocks) => {
    stocks.forEach((price, ticker) => {
        console.log("emitting ", price, " to ", ticker);
        io.in(ticker).emit("livePrices", { ticker, price });
        timerList.push(timer);
      });
    });
  }, 1500);

  io.on("connection", (socket) => {
    socket.emit("Hello", "World");

    socket.on("subscribe", (tickers) => {
      console.log("joining", tickers);
      socket.join(tickers);
      console.log(socket.rooms);
    });
  });

  router.get("/", (req, res, next) => {
    res.render("index", { title: "Live Page" });
  });

  return router;
};
