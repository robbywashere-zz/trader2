const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const db = lowdb(
  //new Memory() require('lowdb/adapters/Memory')
  new FileSync("log.json")
);

db.defaults({
  entries: []
}).write();

function log(entry) {
  db.get("entries")
    .push(entry)
    .write();
}

module.exports = {
  db,
  log
};
