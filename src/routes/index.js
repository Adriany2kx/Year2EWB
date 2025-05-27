const express = require('express');
const router = express.Router();

// Importing JSON files to access page content
const landing = require('../json/english/landing.json');
const dashboard = require('../json/english/dashboard.json');

router.get('/', async(req, res) => {
    if(res.locals.loggedIn) {
        res.render('../src/views/pages/dashboard', {
            dashboard: dashboard,
            user: res.locals.user
        });
    } 
    else {
        res.render('../src/views/pages/landing', {
            landing: landing
        });
    }
});

module.exports = router;