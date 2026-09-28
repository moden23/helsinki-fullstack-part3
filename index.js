const express = require("express");
const morgan = require("morgan");
const Person = require("./models/phonebook");

const app = express();
app.use(express.static("dist"));

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

app.get("/api/persons", (req, res) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => console.log(error));
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({ error: "malformatted id" });
    });
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

  res.send(`<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${requestedTimeFormattedModified}</p>
    </div>`);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id).then((res) => console.log("deleted"));

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
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

  // if (persons.some((person) => person.name === body.name)) {
  //   return res.status(400).json({ error: "name must be unique" });
  // }
  const person = new Person({
    name: body.name,
    phoneNumber: body.phoneNumber,
  });

  person.save().then((personSaved) => {
    res.json(personSaved);
  });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
