const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const phonebookRouter = require("./controller/phonebookController");

const app = express();

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.info("error connecting to MongoDB:", error.message);
  });

app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.morganTiny);
app.use(middleware.morganCustomForPut);
app.use(middleware.requestLogger);

app.use("/api/notes", phonebookRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
