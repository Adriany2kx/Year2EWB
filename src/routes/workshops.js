const express = require('express');
const router = express.Router();

// Importing JSON files to access page content
const workshops = require('../json/english/workshops.json');

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        res.render('../src/views/pages/workshops', {
            workshops: workshops
        });
    }
});

module.exports = router;