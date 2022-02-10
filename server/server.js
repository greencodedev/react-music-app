const express = require("express");
const app = express();
const apiRouter = require("./api/api-router");
const configureMiddleware = require("./api/middleware/api-config");
const serveRouter = require("./api/routes/serveRouter");

configureMiddleware(app);
app.use("/api", apiRouter);
app.use("/", serveRouter)

module.exports = app;
