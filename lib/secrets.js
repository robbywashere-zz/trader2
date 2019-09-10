const lowdb = require('lowdb');
const db = lowdb(
  new(require('lowdb/adapters/Memory'))()
);

const sandBoxApiKey = {
  identifier: 'sandbox-key',
  apiKey: 'c5a5a6174ac6757a127ff8bbdbb814d6',
  secret: `uPHehTZNljiNMXaJvj8mSYW0mzoVbp1qM7By/ALabrwbpq/TI25kzEKU51B3r9Ixs86+SCeqVQAlOLOySXrPLg==`,
  passphrase: '988i8bvxuku',
}

db.defaults({
    secrets: {},
    apiKeys: [sandBoxApiKey],
    selectedKey: sandBoxApiKey.identifier
  })
  .write();

function addKey({
  apiKey,
  passphrase,
  date = new Date(),
  identifier
}) {
  db.get('apiKeys').push({
    identifier,
    secret,
    apiKey,
    passphrase,
    date
  }).write();

}
module.exports = {
  secrets: db,
  addKey
};