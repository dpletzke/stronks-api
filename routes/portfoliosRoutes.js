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

  /**
   * get your portfolio
   */
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

/**
 * trade stock
 * trade: [{"ticker":"AAPL", "numShares": 200}]
 * positive shares number is buying stock, negative is selling
//  * positive trade value is buying stock, negative is selling
 */
  router.post("/", (request, response, next) => {
    const { userId } = request.query;
    const { trade } = request.body;

    const cashReq = getCashById(userId);
    const stockPricesReq = getStockPrices(trade.map((tr) => tr.ticker));
    const portfolioReq = getPortfolioById(userId);

    const newCashReq = Promise.all([cashReq, stockPricesReq]).then(
      ([cash, prices]) => {
        // find any prices that are undefined in the price response
        const missingPrices = Object.keys(prices).filter((ticker) => {
          return !prices[ticker];
        });

        if (missingPrices.length) {
          throw new ErrorHandler(
            404,
            `Invalid Ticker(s): ${missingPrices.join(
              ", "
            )} invalid or not supported`
          );
        }

        const tradeValue = trade.reduce((acc, stock) => {
          return acc - stock.numShares * prices[stock.ticker];
        }, 0);
        if (cash + tradeValue < 0) {
          throw new ErrorHandler(
            403,
            `Invalid Transaction: Cannot afford trade`
          );
        }
        return cash + tradeValue;
      }
    );

    const newPortfolioReq = portfolioReq.then((portfolio) => {
      const invalidTrades = [];
      const newPortfolio = {...portfolio};
      
      // add new shares number to portfolio or throw error with invalid trades
      trade.forEach((tradeStock) => {
        
        // get share values
        const { numShares: tradeShares, ticker } = tradeStock;
        const ownedShares = newPortfolio[ticker]
          ? portfolio[ticker].numShares
          : null;
        console.log({ ownedShares, tradeShares });
        // track if selling more shares than owned and set new shares number
        if (ownedShares + tradeShares < 0) invalidTrades.push(ticker);
        if (ownedShares) newPortfolio[ticker] = ownedShares + tradeShares;
        else newPortfolio[ticker] = tradeShares;

      });

      if (invalidTrades.length) {
        throw new ErrorHandler(
          403,
          `Invalid Transaction(s): Cannot sell more shares than owned for ${invalidTrades.join(
            ", "
          )}`
        );
      }
      return newPortfolio;
    });

    Promise.all([newCashReq, newPortfolioReq])
      .then(([newCash, newPortfolio]) => {
        console.log({ newCash, newPortfolio });
        //upsert stuff
        //return new portfolio
        response.json({ cash: newCash, portfolio: newPortfolio });
      })
      .catch((err) => {
        next(err);
      });
  });

  return router;
};
