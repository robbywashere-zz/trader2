const { AuthenticatedClient: client } = require('coinbase-pro');

const { log } = require('./log');

const apiURI = 'https://api.pro.coinbase.com';
const sandboxURI = 'https://api-public.sandbox.pro.coinbase.com';
const { db } = require('./db');

async function ExecuteBuyOrder(ctx) {
    const { debug } = db.get('config').value();
    const { passphrase, secret, apiKey, amount } = ctx;
    const uri = debug ? sandboxURI : apiURI;
    const authedClient = new client(apiKey, secret, passphrase, uri);
    const order = {
        funds: amount,
        side: 'buy',
        currency: 'BTC',
        product_id: 'BTC-USD',
        type: 'market',
    };
    try {
        const res = await authedClient.placeOrder(order);
        log({ success: res });
        if (debug) console.log(JSON.stringify(res, null, 4));
        return res;
    } catch (e) {
        const error = new Error(e.message);
        log({
            error: {
                msg: e.message,
                e,
            },
        });
        error.info = {
            uri,
            ...order,
        };
        throw error;
    }
}

module.exports = {
    ExecuteBuyOrder,
};
