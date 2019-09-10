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
    profile: {}
  })
  .write();

module.exports = {
  db
};