const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const db = lowdb(
  //new Memory() require('lowdb/adapters/Memory')
  new FileSync('store.json')
);

db.defaults({
    config: {
      amount: 10,
      apiKey: "sandbox-key",
      enabled: false,
      schedule: '* * * * * *',
      debug: true
    },
    profile: {
      password: "3826a6656063e4c65999ff4aa32baac42a9ef040a5875caeff337383613e81f3",
      passwordSalt: "1568182478002",
      email: "admin",
      passwordHash: "bc0f76ccff48b13b44ef45b4fe076502943295f6b709396e0217eb9b0081692d"
    }
  })
  .write();

module.exports = {
  db
};