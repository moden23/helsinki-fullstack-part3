const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());
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
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    phoneNumber: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    phoneNumber: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    phoneNumber: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    phoneNumber: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  const person = persons.find((person) => person.id === id);

  if (person) res.json(person);
  else res.status(404).end();
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
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
  console.log(persons);
});

const generateId = () => {
  let newId = Math.trunc(Math.random() * persons.length * 10000);
  while (persons.find((person) => person.id === newId))
    newId = Math.trunc(Math.random() * persons.length * 100);
  return newId;
};
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

  if (persons.some((person) => person.name === body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }
  const person = {
    id: generateId(),
    name: body.name,
    phoneNumber: body.phoneNumber,
  };
  persons.push(person);
  res.json(person);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
