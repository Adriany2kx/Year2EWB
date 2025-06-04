const express = require('express');
const router = express.Router();

// Importing JSON files to access page content
const profile = require('../json/english/profile.json');

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        res.render('../src/views/pages/profile', {
            profile: profile
        });
    }
});

module.exports = router;