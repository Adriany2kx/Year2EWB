const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.get('/login', (req, res) => {
    const language = res.locals.language;
    const login = require(`../json/${language}/login.json`);
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
    const language = res.locals.language;
    const signup = require(`../json/${language}/signup.json`);
    res.render('../src/views/pages/signup', {
        signup: signup
    });
});

router.get('/resetPassword', (req, res) => {
    const language = res.locals.language;
    const resetPassword = require(`../json/${language}/reset-password.json`);
    res.render('../src/views/pages/reset-password', {
        resetPassword : resetPassword
    })
});

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/resetPassword', userController.resetPassword);

module.exports = router;