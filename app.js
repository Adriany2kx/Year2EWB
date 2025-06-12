const express = require('express');
const app = express();
const port = process.env.port || 3000;
const session = require('express-session');
const helmet = require('helmet');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], 
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
      },
  },
}));


if (process.env.NODE_ENV === 'test') { // Environment variable for the mode it is running on
  app.use((req, res, next) => {
    if (req.headers['x-test-login']) { // Checks if request is for custom HTTP header sent only in test requests
      // Fake user
      req.session = req.session || {};
      req.session.user = { UserID: 1 };
    }
    next();
  });
}

app.use((req, res, next) => {
    const language = req.session.language || 'english';
    res.locals.language = language;
    res.locals.navigation = require(`./src/json/${language}/navigation.json`);
    res.locals.footer = require(`./src/json/${language}/footer.json`);
    res.locals.user = req.session.user || null;
    res.locals.loggedIn = req.session.user;
    next();
});

app.get('/language', (req, res) => {
    const language = req.query.language;
    if (['english', 'isiZulu'].includes(language)) {
      req.session.language = language;
    }
    const back = req.header('Referer') || '/';
    res.redirect(back);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, console.log(`Server listening on port ${port}`));
}

// Routes
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));
app.use('/jobs', require('./src/routes/jobs'));
app.use('/workshops', require('./src/routes/workshops'));
app.use('/volunteering', require('./src/routes/volunteering'));
app.use('/profile', require('./src/routes/profile'));

module.exports = app;