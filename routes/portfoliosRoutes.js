const Router = require("express-promise-router");

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

const { ErrorHandler } = require("../helpers/errorsHelper");

// export our router to be mounted by the parent application
module.exports = (controller) => {
  const {
    getPortfolioById,
    getPortfolioDataById,
    getCashById,
    getStockPrices,
  } = controller;

  /*
   * get your portfolio
   **/
  router.get("/", (req, res) => {
    const { userId } = req.query;

    getPortfolioDataById(userId)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  /*
   * trade stock
   * positive number is buying stock, negative is selling
   * [{"ticker":"AAPL", "numOfShares": 200}]
   **/
  router.post("/", (request, response, next) => {
    const { userId } = request.query;
    const { trade } = request.body;

    const cashReq = getCashById(userId);
    const stockPricesReq = getStockPrices(trade.map((tr) => tr.ticker));
    const portfolioReq = getPortfolioById(userId);

    const newCashReq = Promise.all([cashReq, stockPricesReq]).then(
      ([cash, prices]) => {
        return new Promise((resolve, reject) => {
          console.log(cash, prices);
          // find any tickers that aren't defined in the price response
          const missingPrices = Object.keys(prices).filter((ticker) => {
            return !prices[ticker];
          });

          if (missingPrices.length) {
            console.log({ missingPrices });
            reject(
              new ErrorHandler(
                404,
                `Invalid Ticker(s): ${missingPrices.join(
                  ", "
                )} invalid or not supported`
              )
            );
            return;
          }

          const tradeValue = trade.reduce((acc, stock) => {
            return acc - stock.numOfShares * prices[stock.ticker];
          }, 0);
          console.log({ cash, tradeValue });
          if (cash + tradeValue < 0) {
            reject(
              new ErrorHandler(403, `Invalid Transaction: Cannot afford trade`)
            );
            return;
          }
          resolve(cash + tradeValue);
        });
      }
    );
    const newPortfolioReq = portfolioReq.then((portfolio) => {
      return new Promise((resolve, reject) => {
        console.log({ portfolio });

        const invalidTrades = [];
        const newPortfolio = Object.keys(trade).reduce((acc, tradeStock) => {
          // get share values
          const { numOfShares: tradeShares } = trade[tradeStock];
          const ownedShares = portfolio[tradeStock]
            ? portfolio[tradeStock].numOfShares
            : null;

          // track if selling more shares than owned and set new shares number
          if (ownedShares + tradeShares < 0) invalidTrades.push(tradeStock);
          if (ownedShares) acc[tradeStock] = ownedShares + tradeShares;
          else acc[tradeStock] = tradeShares;

          return acc;
        }, {});

        if (invalidTrades.length) {
          reject(
            new ErrorHandler(
              403,
              `Invalid Transaction(s): Cannot sell more shares than owned for ${invalidTrades.join(
                ", "
              )}`
            )
          );
          return;
        }
        resolve(newPortfolio);
      });
    });

    Promise.all([newCashReq, newPortfolioReq])
      .then(([newCash, newPortfolio]) => {
        console.log({ newCash, newPortfolio });
        //upsert stuff
        //return new portfolio
        response.json({ msg: "Success" });
      })
      .catch((err) => {
        next(err);
      });
  });

  return router;
};
