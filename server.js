const { PORT = 3000, NODE_ENV } = process.env;
const { formError } = require('./templates/helpers/formError');

const { deepEqual } = require('./lib/deepEqual');
const { Cron } = require('./lib/CRON');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { ExecuteBuyOrder } = require('./lib/buyclient');
const bodyParser = require('body-parser');
const app = new express();
const { Hash, Compare, Secret } = require('./lib/crypto');
const { secrets } = require('./lib/secrets');
const { db } = require('./lib/db');
const https = require('https');
const cookieParser = require('cookie-parser');
const secret = name => fs.readFileSync(path.resolve(__dirname, 'secrets', name));

//Constants
const HARD_DEBUG = process.env.HARD_DEBUG === 'true';
//Cronjob

//@Cron
const CRON = new Cron(async function(ctx) {
    const value = Number(db.get('config.amount').value());
    try {
        const resp = await ExecuteBuyOrder(value, ctx);
    } catch (e) {
        console.error(e); //log
    }
});

function Trimmer(req, res, next) {
    req.body = Object.fromEntries(
        Object.entries(req.body).map(([k, v]) => (typeof v === 'string' ? [k, v.trim()] : [k, v])),
    );
    next();
}

// HELPERS
const StaticPage = (...args) => DynPage(...args)();

function Page(name) {
    return require(__dirname + `/templates/pages/${name}`);
}

function Partial(name) {
    return require(__dirname + `/templates/partials/${name}`);
}

function Inline(assetPath) {
    return fs.readFileSync(path.resolve(__dirname, ...assetPath.split('/')));
}

function InlineAsset(assetPath) {
    return Asset(filePath, true);
}

function srcUrl(filePath, type) {
    return !~filePath.indexOf('node_modules') ? `/assets/${type}s/` + filePath : filePath;
}

function extension(filePath) {
    return filePath.split('.').slice(-1)[0];
}

function Asset(filePath, inline = false) {
    const ext = extension(filePath);
    const src = srcUrl(filePath, ext === 'css' ? 'style' : ext == 'js' ? 'script' : 'UNKNOWN');
    const tag = ext === 'js' ? 'script' : inline ? 'style' : 'link';
    const attr = inline ? '' : ext === 'js' ? `src="${src}"` : `href="${src}" rel="stylesheet"`;
    return /*html*/ `<${tag} ${attr}>${inline ? Inline(src) : ''}</${tag}>`;
}

app.use('/node_modules', express.static('node_modules'));

app.use('/assets', express.static('assets'));

// LIB
class ServerError extends Error {
    constructor(message, code = 500) {
        super(message);
        this.code = code;
        this.info = message;
        this.name = this.constructor.name;
    }
}

// ASSETS

const GLOBAL_JS = Asset('global.js');
const CONFIG_VENDOR_JS = Asset('node_modules/cronstrue/dist/cronstrue.min.js');
const VENDOR_STYLE = Asset('node_modules/bulma/css/bulma.min.css');
const GLOBAL_STYLE = Asset('global.css');

const NavBar = active =>
    Partial('navbar')(['home', 'history', 'config', 'apikeys', 'profile'])({
        active,
        enabled: db.get('config.enabled').value(),
    });

const DynPage = (title, head = '', overRides = {}) => (context = {}) =>
    Page('base')({
        head:
            VENDOR_STYLE +
            GLOBAL_STYLE +
            Asset(title + '.css') +
            GLOBAL_JS +
            Asset(title + '.js') +
            head,
        navbar: NavBar(title),
        body: Page(title)(context),
        title,
        ...overRides,
    });

const DynBlankPage = (title, head) => DynPageWithNav(title, head);

app.use(
    bodyParser.urlencoded({
        extended: false,
    }),
    Trimmer,
);

function ProtectedRouter(vetter, router = new express.Router()) {
    for (let verb of `get,post,put,patch,delete`.split(',')) {
        let oldFn = router[verb].bind(router);
        router[verb] = function(path, fn) {
            oldFn(path, vetter, fn);
        };
    }
    return router;
}

const priv = ProtectedRouter((req, res, next) => {
    if (req.signedCookies.authed === 'true') return next();
    res.redirect('/login');
});
app.use(cookieParser(Secret()), priv);
priv.get('/', (req, res) => res.redirect('/home'));
priv.get('/hello', (req, res) => res.send('hello world'));
priv.get('/error', () => {
    throw new Error('!!!');
});

// function filterParams(arr, keys, ) {

//   return keys.reduce(
//     (p, k) => ({
//       ...p,
//       [k]: req.body[k],
//     }), {},
//   ),
// }

priv.post('/apikeys', (req, res) => {
    const keys = ['identifier', 'apiKey', 'passphrase', 'secret'];
    const errors = keys
        .reduce((p, k) => [...p, !req.body[k].length ? k : null], [])
        .filter(Boolean);
    const renderData = {
        errors: [],
        flash: '',
    };
    if (errors.length) {
        renderData.errors = errors.map(k => formError(k, 'missing required field'));
    } else {
        secrets
            .get('apiKeys')
            .push(
                keys.reduce(
                    (p, k) => ({
                        ...p,
                        [k]: req.body[k],
                    }),
                    {},
                ),
            )
            .write();
        renderData.flash = 'api key successfully added!';
    }

    res.send(DynPage('apikeys')(renderData));
});
priv.get('/apikeys', (req, res) => {
    res.send(DynPage('apikeys')({}));
});
priv.get('/config', (req, res) =>
    res.send(
        DynPage(
            'config',
            CONFIG_VENDOR_JS,
        )({
            config: {
                ...db.get('config').value(),
                hardDebug: HARD_DEBUG,
                apiKeys: secrets
                    .get('apiKeys')
                    .map('identifier')
                    .value(),
                selectedKey: secrets.get('selectedKey').value(),
            },
        }),
    ),
);
priv.post('/config', (req, res) => {
    const selectedKey = req.body.selectedKey; //value of drop down select
    const oldKey = secrets.get('selectedKey').value();
    const oldConfig = db.get('config').value();
    const isNewKey = oldKey !== selectedKey;
    const enabled = req.body.enabled === 'on' ? true : false;
    const debug = HARD_DEBUG ? HARD_DEBUG : req.body.debug === 'on' ? true : false;
    //const apiKey = (req.body.apikey);
    const schedule = req.body.schedule
        .split(' ')
        .filter(Boolean)
        .join(' ');

    delete req.body.selectedKey;
    db.update('config', c => ({
        ...c,
        ...req.body,
        debug,
        enabled,
        schedule,
    })).write();

    if (isNewKey) secrets.set('selectedKey', selectedKey).write();

    const newConfig = db.get('config').value();

    if (!deepEqual(newConfig, oldConfig) || isNewKey) {
        if (newConfig.enabled) {
            //get new key froom db
            const ctx = secrets
                .get('apiKeys')
                .find({ identifier: selectedKey })
                .value();
            if (!ctx)
                throw new Error(`ctx is undefined, unable to find api key id: ${selectedKey}`);
            CRON.start(newConfig.schedule, ctx);
        } else {
            CRON.stop();
        }
    }
    res.redirect('/config');
});

priv.post('/profile', (req, res) => {
    const { password, confirmPassword, email, confirmEmail } = req.body;

    let renderData = {
        errors: [],
        flash: '',
        email,
    };

    if (email.length || confirmEmail.length) {
        if (email !== confirmEmail)
            renderData.errors.push({
                message: 'emails do not match',
                name: 'email',
                value: email,
            });
        else {
            db.set('profile.email', email).write();
            renderData.flash += 'Email set successfully!\n';
        }
    }

    if (password.length || confirmPassword.length) {
        if (password !== confirmPassword)
            renderData.errors.push({
                message: 'passwords do not match',
                name: 'password',
                value: password,
            });
        else {
            const salt = new Date().getTime() + '';
            db.set('profile.passwordHash', Hash(password, salt))
                .set('profile.passwordSalt', salt)
                .write();
            renderData.flash += 'Password set successfully!';
        }
    }

    res.send(DynPage('profile')(renderData));
});

priv.get('/profile', (req, res) =>
    res.send(
        DynPage('profile')({
            email: db.get('profile.email').value(),
        }),
    ),
);

priv.get('/home', (req, res) => res.send(StaticPage('home')));

priv.get('/history', (req, res) =>
    res.send(
        DynPage('history')({
            history: {},
        }),
    ),
);

priv.get('/logout', (req, res, next) => {
    res.clearCookie('authed');
    return res.redirect('/login');
});
//priv.get("/extra", (req, res) => res.send(StaticPage('extra')));

// Public routes

app.get('/login', (req, res) => {
    res.send(
        DynPage('login', '', {
            navbar: '',
        })({}),
    );
});

app.post('/login', (req, res) => {
    const { password: reqPassword = null, email: reqEmail = null } = req.body;
    if (!reqEmail || !reqPassword) {
        throw new ServerError('bad request', 400);
    }

    const { passwordHash, passwordSalt, email } = db.get('profile').value();

    if (Compare(email, reqEmail) && Compare(passwordHash, Hash(reqPassword, passwordSalt))) {
        res.cookie('authed', 'true', {
            signed: true,
        });
        res.redirect('/home');
    } else {
        res.send(
            DynPage('login', '', {
                navbar: '',
            })({
                errors: [
                    formError('email', 'email or password is incorrect', reqEmail),
                    formError('password', ''),
                ],
            }),
        );
    }
});

app.get('*', function(req, res) {
    throw new ServerError(`Not Found`, 404);
});

app.use(function(error, req, res, next) {
    error.code = error.code || 500;
    if (error.code >= 500) console.error(error);
    res.send(
        DynPage('error', '', {
            navbar: '',
        })({
            req,
            error,
        }),
    );
});

// Start

if (HARD_DEBUG) db.set('config.debug', true).write();

if (db.get('config.enabled').value()) {
    // Oops key would be gone CRON.start(db.get('config.schedule').value());
    db.set('config.enabled', false).write();
}

const cert = secret('cert.pem');
const key = secret('cert.key');

(NODE_ENV === 'production'
    ? https.createServer(
          {
              key,
              cert,
          },
          app,
      )
    : app
).listen(PORT, () =>
    console.log(
        NODE_ENV !== 'production'
            ? `Listening http://localhost:${PORT}`
            : `Listening https://raider:${PORT}`,
    ),
);
