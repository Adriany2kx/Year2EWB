const express = require('express');
const app = express();
const port = process.env.port || 3000;
const session = require('express-session');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.listen(port, console.log(`Server listening on port ${port}`))

// By default all content will be in English
const navigation = require('./src/json/english/navigation.json');
const footer = require('./src/json/english/footer.json');

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

// Routes
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));