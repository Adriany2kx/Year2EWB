const workshopModel = require('../models/workshop-model');
const postController = require('./post-controller');

// handles creating a new workshop post
exports.postWorkshop = async (req, res) => {
    const userID = res.locals.user.UserID;
    const { title, description, location, startDate, applyBy, date, remainingSlots } = req.body;

    try {
        const postID = await postController.createPost(
            userID, title, description, location, startDate, applyBy, 'Workshop'
        );
        await workshopModel.createWorkshop(
            postID,
            date || startDate || new Date().toISOString().slice(0, 10),
            remainingSlots
        );
        res.redirect('/workshops');
    } catch (err) {
        console.error(err);
        res.status(500).send("failed to post workshop");
    }
};

// gets filtered workshop results
exports.fetchFiltered = async (searchTerm = '', filterOption = '') => {
    try {
        const workshops = await workshopModel.fetchFiltered(searchTerm, filterOption);
        return workshops;
    } catch (err) {
        throw err;
    }
};

// deletes a workshop by id
exports.deleteWorkshop = async (req, res) => {
    const { id } = req.params;
    
    if (!workshopModel.deleteWorkshop) {
        res.status(500).send('delete function not found');
        return;
    }
    
    try {
        await workshopModel.deleteWorkshop(id);
        res.redirect('/workshops');
    } catch (err) {
        console.error('Error deleting workshop:', err);
        res.status(500).send('failed to delete workshop');
    }
};