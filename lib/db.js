const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { Hash } = require("./crypto");
const db = lowdb(
  //new Memory() require('lowdb/adapters/Memory')
  new FileSync("store.json")
);

db.defaults({
  config: {
    amount: 10,
    apiKey: "sandbox-key",
    enabled: false,
    schedule: "* * * * * *",
    debug: true
  },
  profile: {
    passwordSalt: "123456789",
    email: "admin",
    passwordHash: Hash("password", "123456789")
  }
}).write();

module.exports = {
  db
};
