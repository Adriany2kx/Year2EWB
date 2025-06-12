const express = require('express');
const router = express.Router();
const volunteeringController = require('../controllers/volunteering-controller');

//runs before any routes for volunteeering page to make sure user logged in
router.use((req, res, next) => {
    if (!res.locals.loggedIn) {
        return res.redirect('/users/login');
    }
    next(); 
});

router.get('/', volunteeringController.renderVolunteeringPage);
router.post('/join/:id', volunteeringController.handleJoinEvent);
router.post('/create', volunteeringController.handleCreate);
router.post('/unjoin/:id', volunteeringController.handleUnjoinEvent);
router.post('/delete/:id', volunteeringController.handleDeleteEvent);


module.exports = router;