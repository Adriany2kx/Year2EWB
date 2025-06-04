const express = require('express');
const router = express.Router();

// Importing JSON files to access page content
const volunteering = require('../json/english/volunteering.json');

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        res.render('../src/views/pages/volunteering', {
            volunteering: volunteering
        });
    }
});

module.exports = router;