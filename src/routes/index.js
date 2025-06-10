const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    const language = res.locals.language;
    const landing = require(`../json/${language}/landing.json`);
    const dashboard = require(`../json/${language}/dashboard.json`);
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