const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job-controller');

// Importing JSON files to access page content
const jobs = require('../json/english/jobs.json');

router.get('/', async (req, res) => {
    if (!res.locals.loggedIn) {
        return res.redirect('/users/login');
    }
    const searchTerm = req.query.search || '';
    const filterOption = req.query.filter || '';
    try {
        const jobVacancies = await jobController.fetchFiltered(searchTerm, filterOption);
        res.render('../src/views/pages/jobs', {
            jobs: jobs,
            jobVacancies: jobVacancies || [],
            searchTerm: searchTerm,
            filterOption: filterOption
        });
    } 
    catch (err) {
        console.error(err);
    }
});

router.post('/', jobController.postJob);

module.exports = router;