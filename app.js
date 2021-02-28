const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const socketio = require("socket.io");

const app = express();
const http = require('http');
const server = http.createServer(app);

const io = socketio(server, { origins: '*:*', pingTimeout: 10000});

const { errorMiddleware } = require("./middlewares/errorMiddleware");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const mountRoutes = require("./routes/indexRoutes");
mountRoutes(app, io);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error middleware
app.use(errorMiddleware);

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    statusCode: err.statusCode,
    message: err.message,
  });
});

module.exports = { app, server };
