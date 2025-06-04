const express = require('express');
const router = express.Router();

// Importing JSON files to access page content
const jobs = require('../json/english/jobs.json');

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        res.render('../src/views/pages/jobs', {
            jobs: jobs
        });
    }
});

module.exports = router;