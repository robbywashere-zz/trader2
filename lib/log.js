const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const db = lowdb(
  //new Memory() require('lowdb/adapters/Memory')
  new FileSync('log.json')
);

db.defaults({
    entries: []
  })
  .write();

module.exports = {
  log: db
};