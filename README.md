# Stronks API

Basic API to provide paper stock trading of fake stocks and prices
- REST routes of login and trading
- Socket.io server endpoint and client test file for live-stock prices 
  
### Setup
0. Clone to local, run npm install
1. create .env based on example, create database in local environment
1. run  `npm run dev` at root
2. Use Insomnia, Postman or some other routes tester on routes below
3. run `node ./test/socketClient.js` at root for live-price data
4. the client terminal logs the live price stream sent from server 

## Stack

Stronks Api is built with Postgres and Express, uses Knex for query building and Socket.io for live data 

Highlights in the implementation:
* portfolios routes and controller
  * aync code allow for concurrency when validating trades 
  * JSDoc documentation on important code 
* user friendly error handling everywhere
* user is authenticated for their data only 
* in-memory stock data structure easy for an api and database to take its place
  * using Map for stocks dataStore for faster read/write 

## Routes
login with a seeded user

POST /login
```json
//body
{
	"email":"test@test.com",
	"password":"test"
}
```
```json
//response
{
  "token": // jwt token,
  "userId": // userId
}
```
### for all other routes, include token in header as `token`
and userId in query eg `http://localhost:3000/portfolios?userId=100`

---

### GET /portfolios - get users current portfolio and current price of stock
```json
//response
{
  "AAPL": {
    "ticker": "AAPL",
    "numShares": 2,
    "price": 133.17
  },
  "TSLA": {
    "ticker": "TSLA",
    "numShares": 1,
    "price": 659.01
  }
}
```
---
### POST /portfolios - buy and sell stock

```json
// body
{
	"trades": [
		{"ticker":"TSLA", "numShares": -1},
		{"ticker":"OPK", "numShares": 5}
	]
}
```

```json
//response
{
  "updatedCashAmount": 837.43,
  "tradeConfirmation": [
    {
      "ticker": "TSLA",
      "numShares": -1,
      "tradedAtPrice": 758.83
    },
    {
      "ticker": "OPK",
      "numShares": 5,
      "tradedAtPrice": 4.28
    }
  ],
  "newShareAmounts": [
    {
      "ticker": "TSLA",
      "numShares": 0
    },
    {
      "ticker": "OPK",
      "numShares": 5
    }
  ]
}
```
---
### GET /users - get all user data

```json
//response
{
  "id": 100,
  "email": "test@test.com",
  "password": "$2b$10$0.I8kBYNpSfdc.X8.aXbV.2XNB/hWyvPcCpYC2Bh.wPQ0FMadduRi",
  "cash": "467.23",
  "created_at": "2021-02-28T10:32:00.574Z",
  "updated_at": "2021-02-28T10:32:00.574Z"
}
```
---
### GET /users/cash - get only user's cash amount

```json
//response
467.23
```
---
### POST /users/cash - increment user's cash amount

```json
//body
{
	"cash": 33
}
```
```json
//response
500.23
```
---