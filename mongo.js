require("dotenv").config();
const moongoose = require("mongoose");
console.log(process.argv.length);
if (process.argv.length < 3) {
  console.log("forgot password");
  process.exit(1);
}
const db_username = process.env.DB_USERNAME;
const db_password = process.argv[2];
console.log(db_username);
const url = `mongodb+srv://${db_username}:${db_password}@cluster0.abxhdz4.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

moongoose.set("strictQuery", false);
moongoose.connect(url, { family: 4 });

const phoneBookSchema = new moongoose.Schema({
  name: String,
  phoneNumber: String,
});

const PhoneBookEntry = moongoose.model("Phone", phoneBookSchema);

if (process.argv.length === 3) {
  PhoneBookEntry.find({}).then((result) => {
    result.forEach((phoneBookEntry) => {
      console.log(phoneBookEntry);
    });
    moongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const phoneBookEntryName = process.argv[3];
  const phoneBookEntryPhoneNumber = process.argv[4];

  const phoneBookEntry = new PhoneBookEntry({
    name: phoneBookEntryName,
    phoneNumber: phoneBookEntryPhoneNumber,
  });

  phoneBookEntry.save().then((result) => {
    console.log("note saved");
    moongoose.connection.close();
  });
}
