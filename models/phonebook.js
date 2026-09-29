const config = require("./utils/config");
const mongoose = require("mongoose");

const url = config.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(url, { family: 4 })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const many = [
  {
    validator: function checkDash(number) {
      const dashIndex = number.indexOf("-");
      if (dashIndex === -1 || dashIndex === 0) return false;
    },
    message: "please put dash after the first 2 or 3 digits",
  },
  {
    validator: function checkNumbers(number) {
      const dashIndex = number.indexOf("-");
      const firstPart = number.slice(0, dashIndex);
      const secondPart = number.slice(dashIndex + 1);
      console.log(firstPart, secondPart);
      if (!(Number(firstPart) && Number(secondPart))) return false;
    },
    message: "please dont add characters",
  },
  {
    validator: function firstPartDigitsCheck(number) {
      const dashIndex = number.indexOf("-");
      const firstPart = number.slice(0, dashIndex);
      console.log(dashIndex, firstPart);
      if (!(firstPart.length === 2 || firstPart.length === 3)) return false;
    },
    message: "please fist part of phonenumber to be 2-3 digits",
  },
];

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  phoneNumber: {
    type: String,
    minLength: 8,
    required: true,
    validate: many,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Phone", personSchema);
