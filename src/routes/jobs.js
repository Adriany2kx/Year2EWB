const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job-controller');

// Importing JSON files to access page content
const jobs = require('../json/english/jobs.json');

router.get('/', async(req, res) => {
    if(!res.locals.loggedIn) {
        res.redirect('/users/login');
    }
    else {
        const jobVacancies = await jobController.fetchAll();
        console.log(jobVacancies)
        res.render('../src/views/pages/jobs', {
            jobs: jobs,
            jobVacancies: jobVacancies
        });
    }
});

router.post('/jobs', jobController.postJob);

module.exports = router;