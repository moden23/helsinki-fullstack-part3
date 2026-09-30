const phonebookRouter = require("express").Router();
const Person = require("./models/phonebook");

phonebookRouter.get("/", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

phonebookRouter.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

phonebookRouter.get("/info", (req, res, next) => {
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

phonebookRouter.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  Person.findByIdAndDelete(id)
    .then((res) => res.status(204).end())
    .catch((error) => next(error));
});

phonebookRouter.post("/", (req, res, next) => {
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

phonebookRouter.put("/:id", (req, res, next) => {
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

phonebookRouter.get("/info", (req, res, next) => {
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

module.exports = phonebookRouter;
