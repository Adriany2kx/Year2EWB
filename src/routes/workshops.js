const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshop-controller');

// get workshops page, handle search/filter
router.get('/', async (req, res) => {
    if (!res.locals.loggedIn) {
        return res.redirect('/users/login');
    }
    
    const searchTerm = req.query.search || '';
    const filterOption = req.query.filter || '';
    const language = res.locals.language || 'english';
    const workshops = require(`../json/${language}/workshops.json`);
    
    try {
        const workshopListings = await workshopController.fetchFiltered(searchTerm, filterOption);
        res.render('../src/views/pages/workshops', {
            workshops: workshops,
            workshopListings: workshopListings || [],
            searchTerm: searchTerm,
            filterOption: filterOption
        });
    } catch (err) {
        console.error('error fetching workshops:', err);
        res.status(500).send('failed to load workshops');
    }
});

// handle new workshop post
router.post('/', workshopController.postWorkshop);

// handle workshop delete
router.post('/delete/:id', workshopController.deleteWorkshop);

module.exports = router;