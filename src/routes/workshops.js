const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        const language = res.locals.language;
        const workshops = require(`../json/${language}/workshops.json`);
        res.render('../src/views/pages/workshops', {
            workshops: workshops
        });
    }
});

module.exports = router;