const express = require("express");
const morgan = require("morgan");
// const cors = require("cors");
const Person = require("./models/phonebook");

const app = express();
app.use(express.static("dist"));
// app.use(cors());
const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
};
app.use(express.json());
app.use(
  morgan("tiny", {
    skip: function (req, res) {
      return req.method === "POST";
    },
  }),
);

morgan.token("person", function (req, res) {
  console.log(req.body);
  const { name, phoneNumber } = req.body;
  return `${name} ${phoneNumber}`;
});

app.use(
  morgan(
    `POST /api/persons :status :res[content-length] - :response-time ms :person`,
    {
      skip: function (req, res) {
        return req.method !== "POST";
      },
    },
  ),
);

app.use(requestLogger);

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  const requestedTime = new Date();
  const requestedTimeFormatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Europe/Athens",
  }).format(requestedTime);

  const requestedTimeFormattedModified = requestedTimeFormatted.replace(
    " EEST",
    " GTM+0200 (Eastern European Standar Time)",
  );

  Person.find({})
    .then((persons) => {
      res.send(`<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${requestedTimeFormattedModified}</p>
    </div>`);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  Person.findByIdAndDelete(id)
    .then((result) => res.status(204).end())
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }
  if (!body.name) {
    return res.status(400).json({ error: "name is missing" });
  }
  if (!body.phoneNumber) {
    return res.status(400).json({ error: "phone phoneNumber is missing" });
  }

  const person = new Person({
    name: body.name,
    phoneNumber: body.phoneNumber,
  });

  person
    .save()
    .then((personSaved) => {
      res.json(personSaved);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, phoneNumber } = req.body;
  Person.findById(req.params.id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }

      person.name = name;
      person.phoneNumber = phoneNumber;

      return person.save().then((updatedNote) => {
        res.json(updatedNote);
      });
    })
    .catch((error) => next(error));
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
const errorHandler = (error, request, response, next) => {
  console.log("ERRO MESSAGE", error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
