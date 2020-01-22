const lowdb = require('lowdb');
const db = lowdb(new (require('lowdb/adapters/Memory'))());

const sandBoxApiKey = {
    ident: 'sandbox-key',
    apiKey: 'c5a5a6174ac6757a127ff8bbdbb814d6',
    secret: `uPHehTZNljiNMXaJvj8mSYW0mzoVbp1qM7By/ALabrwbpq/TI25kzEKU51B3r9Ixs86+SCeqVQAlOLOySXrPLg==`,
    passphrase: '988i8bvxuku',
};

db.defaults({
    apiKeys: [sandBoxApiKey],
}).write();

function addKey({ apiKey, passphrase, secret, date = new Date(), ident }) {
    db.get('apiKeys')
        .push({
            ident,
            secret,
            apiKey,
            passphrase,
            date,
        })
        .write();
}
module.exports = {
    secrets: db,
    addKey,
};
