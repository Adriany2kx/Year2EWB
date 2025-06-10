const express = require('express');
const app = express();
const port = process.env.port || 3000;
const session = require('express-session');
const helmet = require('helmet');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(helmet());

// By default all content will be in English
const navigation = require('./src/json/english/navigation.json');
const footer = require('./src/json/english/footer.json');

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

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.locals.navigation = navigation;
    res.locals.footer = footer;
    res.locals.user = req.session.user || null;
    res.locals.loggedIn = req.session.user;
    next();
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