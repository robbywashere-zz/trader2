const {
  formError
} = require("./templates/helpers/formError");

const {
  deepEqual
} = require("./lib/deepEqual");
const {
  Cron
} = require("./lib/CRON");
const express = require("express");
const path = require('path');
const fs = require('fs');
const {
  ExecuteBuyOrder
} = require('./lib/buyclient');
const bodyParser = require('body-parser');
const app = new express();
const {
  Hash,
  Compare,
  Secret
} = require('./lib/crypto');
const {
  secrets
} = require('./lib/secrets');
const {
  db
} = require('./lib/db');
const cookieParser = require('cookie-parser')

//Cronjob

const CRON = new Cron(async () => {
  const value = Number(db.get('config.amount').value());
  try {
    const resp = await ExecuteBuyOrder(value);
  } catch (e) {
    console.error(e); //log
  }
});

function Trimmer(req, res, next) {
  req.body = Object.fromEntries(Object.entries(req.body).map(([k, v]) => typeof v === "string" ? [k, v.trim()] : [k, v]));
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

function Asset(assetPath) {
  return fs.readFileSync(path.resolve(__dirname, ...assetPath.split('/')));
}


function Tag({
  name,
  ext
}) {
  return (filePath) => `<${name}>
    ${Asset((!~filePath.indexOf('node_modules') ? `assets/${name}s/` + filePath + ext : filePath))}
  </${name}>`;
}

const Module = (path) => Tag({
  name: 'script',
  ext: '.js'
})('node_modules/' + path);

const Style = Tag({
  name: 'style',
  ext: '.css'
});
const Script = Tag({
  name: 'script',
  ext: '.js'
});

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

const VENDOR_JS = '';
const CONFIG_VENDOR_JS = Module('cronstrue/dist/cronstrue.min.js');
const VENDOR_STYLE = Style('node_modules/bulma/css/bulma.min.css');
const MAIN_STYLE = Style('main');
const ERROR_STYLE = Style('error');


const NavBar = (active) => Partial('navbar')(['home', 'history', 'config', 'apikeys', 'profile'])({
  active,
  enabled: db.get('config.enabled').value()
});

const DynPage = (title, head = '', overRides = {}) => (context = {}) => Page('base')({
  head: VENDOR_STYLE + MAIN_STYLE + Style(title) + VENDOR_JS + Script(title) + head,
  navbar: NavBar(title),
  body: Page(title)(context),
  title,
  ...overRides
});

const DynBlankPage = (title, head) => DynPageWithNav(title, head);


app.use(bodyParser.urlencoded({
  extended: false,
}), Trimmer)

function ProtectedRouter(
  vetter,
  router = new express.Router()) {
  for (let verb of `get,post,put,patch,delete`.split(',')) {
    let oldFn = router[verb].bind(router);
    router[verb] = function (path, fn) {
      oldFn(path, vetter, fn);
    }
  }
  return router;
}

const priv = ProtectedRouter((req, res, next) => {
  if (req.cookies.authed === "true") {
    return next();
  }
  res.redirect('/login');
});
app.use(cookieParser(Secret()), priv);
priv.get("/", (req, res) => res.redirect('/home'));
priv.get("/hello", (req, res) => res.send("hello world"));
priv.get("/error", () => {
  throw new Error('!!!')
});
priv.post('/apikeys', (req, res) => {
  const keys = ['identifier', 'apiKey', 'passphrase', 'secret'];
  const errors = keys.reduce((p, k) => ([...p, (!req.body[k].length ? k : null)]), []).filter(Boolean);
  const renderData = {
    errors: [],
    flash: ""
  }
  if (errors.length) {
    renderData.errors = errors.map(k => formError(k, 'missing required field'));
  } else {
    secrets.get('apiKeys').push(keys.reduce((p, k) => ({
      ...p,
      [k]: req.body[k]
    }), {})).write();
    renderData.flash = 'api key successfully added!';
  }

  res.send(DynPage('apikeys')(renderData));
})
priv.get('/apikeys', (req, res) => {
  res.send(DynPage('apikeys')({}));
});

priv.post("/config", (req, res) => {
  const newKey = req.body.selectedKey;
  delete req.body.selectedKey;
  const oldKey = secrets.get('selectedKey').value();

  const oldConfig = db.get('config').value();
  const enabled = (req.body.enabled === "on" ? true : false);
  //const apiKey = (req.body.apikey);
  const schedule = req.body.schedule.split(' ').filter(Boolean).join(' ');
  db.update('config', c => ({
    ...c,
    ...req.body,
    enabled,
    schedule
  })).write();

  if (oldKey !== newKey) secrets.set('selectedKey', newKey).write();

  const newConfig = db.get('config').value();
  if (!deepEqual(newConfig, oldConfig) || oldKey !== newKey) {
    if (newConfig.enabled) {
      CRON.start(newConfig.schedule);
    } else {
      CRON.stop();
    }
  }
  res.redirect('/config');
})


priv.post("/profile", (req, res) => {
  const {
    password,
    confirmPassword,
    email,
    confirmEmail
  } = req.body;

  let renderData = {
    errors: [],
    flash: ""
  };

  if (email.length || confirmEmail.length) {
    if (password !== confirmPassword) renderData.errors.push({
      message: 'emailss do not match',
      name: 'email',
      value: email
    });
    else {
      db.set("profile.email", email).write();
      renderData.flash += "Email set successfully!\n"
    }
  }

  if (password.length || confirmPassword.length) {
    if (password !== confirmPassword) renderData.errors.push({
      message: 'passwords do not match',
      name: 'password',
      value: password
    });
    else {
      const salt = (new Date()).getTime() + "";
      db.set('profile.passwordHash', Hash(password, salt))
        .set('profile.passwordSalt', salt)
        .write();
      renderData.flash += "Password set successfully!"
    }
  }

  res.send(DynPage('profile')(renderData));
});

priv.get("/profile", (req, res) => res.send(DynPage('profile')({
  email: db.get('profile.email').value()
})));

priv.get("/config", (req, res) => res.send(DynPage('config', CONFIG_VENDOR_JS)({
  config: {
    ...db.get('config').value(),
    apiKeys: secrets.get('apiKeys').map('identifier').value(),
    selectedKey: secrets.get('selectedKey').value()
  }
})));

priv.get("/home", (req, res) => res.send(StaticPage('home')));


priv.get("/history", (req, res) => res.send(DynPage('history')({
  history: {}
})));

priv.get("/logout", (req, res, next) => {
  res.clearCookie("authed");
  return res.redirect("/login");
})
//priv.get("/extra", (req, res) => res.send(StaticPage('extra')));


// Public routes

app.get('/login', (req, res) => {
  res.send(DynPage('login', '', {
    navbar: ''
  })({}));
});

app.post('/login', (req, res) => {
  const {
    password: reqPassword = null,
    email: reqEmail = null
  } = req.body;
  if (!reqEmail || !reqPassword) {
    throw new ServerError('bad request', 400);
  }

  const {
    passwordHash,
    passwordSalt,
    email
  } = db.get('profile').value();

  if (Compare(email, reqEmail) && Compare(passwordHash, Hash(reqPassword, passwordSalt))) {
    res.cookie('authed', "true");
    res.redirect('/home');
  } else {
    res.send(DynPage('login', '', {
      navbar: ''
    })({
      errors: [
        formError("email", "email or password is incorrect", reqEmail),
        formError("password", ""),
      ]
    }));
  }

});

app.get('*', function (req, res) {
  throw new ServerError(`Not Found`, 404);
});

app.use(function (error, req, res, next) {
  //if (process.env.NODE_ENV !== "production")
  console.error(error);
  error.code = error.code || 500;
  res.send(DynPage('error', '', {
    navbar: ''
  })({
    req,
    error
  }));
})

// Start 

if (db.get('config.enabled').value()) {
  CRON.start(db.get('config.schedule').value());
}


app.listen(3000, () => console.log("Listening http://localhost:3000"));