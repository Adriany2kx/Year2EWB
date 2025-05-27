const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Importing JSON files to access page content
const login = require('../json/english/login.json');
const signup = require('../json/english/signup.json');

router.get('/login', (req, res) => {
    res.render('../src/views/pages/login', {
        login: login
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            throw err;
        }
        res.redirect('/');
    });
});

router.get('/signup', (req, res) => {
    res.render('../src/views/pages/signup', {
        signup: signup
    });
});

router.post('/login', userController.login);
router.post('/signup', userController.signup);

module.exports = router;