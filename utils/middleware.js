const logger = require("./logger.js");
const morgan = require("morgan");
const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

morgan.token("person", function (req) {
  logger.info(req.body);
  const { name, phoneNumber } = req.body;
  return `${name} ${phoneNumber}`;
});

const morganTiny = () => {
  morgan("tiny", {
    skip: function (req) {
      return req.method === "POST";
    },
  });
};

const morganCustomForPut = () => {
  morgan(
    "POST /api/persons :status :res[content-length] - :response-time ms :person",
    {
      skip: function (req) {
        return req.method !== "POST";
      },
    },
  );
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  morganTiny,
  morganCustomForPut,
};
