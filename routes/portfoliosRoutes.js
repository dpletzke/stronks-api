const Router = require("express-promise-router");

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

const { ErrorHandler } = require("../helpers/errorsHelper");
const { validateTradeFormat } = require("../helpers/validateInputHelpers");

// export our router to be mounted by the parent application
module.exports = (controller) => {
  const {
    getPortfolioById,
    getPortfolioDataById,
    getCashById,
    updateCashById,
    getStockPrices,
    updatePortfolio,
    getStockIds,
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
   * accepts request body: trades: [{"ticker":"AAPL", "numShares": 200}]
   * positive shares number is buying stock, negative is selling
   * negative trade value is buying stock, positive is selling
   */
  router.post("/", (request, response, next) => {
    const { userId } = request.query;
    const { trades } = request.body;

    if (!validateTradeFormat(trades)) {
      next(
        new ErrorHandler(
          400,
          `Invalid trade(s): format is [{ ticker: "XXX", numShares:123 }]`
        )
      );
      return;
    }

    const cashReq = getCashById(userId);
    const stockPricesReq = getStockPrices(trades.map((tr) => tr.ticker));
    const portfolioReq = getPortfolioById(userId);

    /**
     * validates user can afford trades and that tickers being bought exist
     * - supports buying and selling stocks in the same transaction
     * @returns calculated new value of users account but doesn't make change
     * @returns what prices of the stocks were calculated at
     */
    const newCashAndPricesReq = Promise.all([cashReq, stockPricesReq]).then(
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
        console.log({ prices, cash });
        const tradeValue = trades.reduce((acc, stock) => {
          console.log({ acc, stock });
          return acc - stock.numShares * prices[stock.ticker];
        }, 0);
        console.log(tradeValue, cash);
        if (cash + tradeValue < 0) {
          throw new ErrorHandler(
            403,
            `Invalid Transaction: Cannot afford trade(s)`
          );
        }
        return { cash: cash + tradeValue, prices };
      }
    );

    /**
     * validates users has enough stock to sell
     * @param user current portfolio
     * @returns calculated new share values but doesn't make change
     */
    const newPortfolioSharesReq = portfolioReq.then((portfolio) => {
      const invalidTrades = [];
      const newPortfolioShares = {};
      // console.log({ portfolio });
      // add new shares number to portfolio or throw error with invalid trades
      trades.forEach((tradeStock) => {
        // get share values
        // console.log(tradeStock);
        const { numShares: tradeShares, ticker } = tradeStock;
        const ownedShares = portfolio[ticker]
          ? portfolio[ticker].numShares
          : null;

        // console.log({ ownedShares });
        // track if selling more shares than owned and set new shares number
        if (ownedShares + tradeShares < 0) invalidTrades.push(ticker);

        newPortfolioShares[ticker] = {
          ticker,
          numShares: ownedShares + tradeShares,
        };
      });

      // console.log({ newPortfolioShares });

      if (invalidTrades.length) {
        throw new ErrorHandler(
          403,
          `Invalid Transaction(s): Cannot sell more shares than owned for ${invalidTrades.join(
            ", "
          )}`
        );
      }
      return newPortfolioShares;
    });

    /**
     * makes changes to db
     * - updates cash value for user
     * - updates owned stock
     * @param {Promise} newCashAndPrices - cash value for user to
     * be updated and stock prices bought at
     * @param {Promise} newPortfoiloShares - share values to be inserted
     * @returns Promise of inserts
     */
    Promise.all([newCashAndPricesReq, newPortfolioSharesReq])
      .then(([newCashAndPrices, newPortfolioShares]) => {
        const { prices, cash } = newCashAndPrices;

        const cashUpdate = updateCashById(userId, cash);

        // fetch stock Ids required to insert into user_stocks table
        const stockIdsReq = getStockIds(newPortfolioShares);

        // pass what prices the stocks were bought at in new Promise to avoid
        // passing calced new cash
        const passPrices = new Promise((res) => res(prices));

        // return cash update, stockIdsRef, pass forward new shares and prices
        return Promise.all([
          cashUpdate,
          stockIdsReq,
          newPortfolioSharesReq,
          passPrices,
        ]);
      })
      .then(([cash, stockIdsRef, newPortfolioShares, prices]) => {
        const prepareNewShares = Object.values(newPortfolioShares).map(
          (nps) => {
            return {
              number_of_shares: nps.numShares,
              stock_id: stockIdsRef[nps.ticker],
              user_id: userId,
            };
          }
        );

        const upsertSharesReq = updatePortfolio(prepareNewShares);
        const passData = new Promise((res) =>
          res({ cash, prices, stockIdsRef })
        );

        return Promise.all([upsertSharesReq, passData]);
      })
      .then(([upsertedShares, { cash, prices, stockIdsRef }]) => {
        // format and send response data
        const responseData = {
          updatedCashAmount: Number(cash),
          tradeConfirmation: trades.map((tr) => {
            return { ...tr, tradedAtPrice: prices[tr.ticker] };
          }),
          newShareAmounts: upsertedShares.map((upss) => {
            return {
              ticker: Object.keys(stockIdsRef).find(
                (ticker) => stockIdsRef[ticker] === upss.stockId
              ),
              numShares: Number(upss.numShares),
            };
          }),
        };

        response.json(responseData);
      })
      .catch((err) => {
        next(err);
      });
  });
  return router;
};
