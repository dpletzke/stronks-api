const validateTradeFormat = (trades) => {
  return trades.every(trade => {
    const tickerIsString = typeof trade.ticker === 'string';
    const numSharesIsNumber = typeof trade.numShares === 'number';
    return tickerIsString && numSharesIsNumber
  })
}

module.exports = {
  validateTradeFormat
}