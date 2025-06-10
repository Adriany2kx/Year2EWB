const jobModel = require('../models/job-model');
const postController = require('./post-controller');

exports.postJob = async (req, res) => {
    const userID = res.locals.user.UserID;
    const {title, description, location, startDate, applyBy, hourlyRate, contract, weeklyHours} = req.body;
    try {
        const postID = await postController.createPost(userID, title, description, location, startDate, applyBy, 'Job');
        await jobModel.createJob(postID, hourlyRate, contract, weeklyHours);
        res.redirect('/jobs'); 
    }
    catch (err) {
        throw err;
    }
};

exports.fetchFiltered = async (searchTerm = '', filterOption = '') => {
    try {
        const jobs = await jobModel.fetchFiltered(searchTerm, filterOption);
        return jobs;
    }
    catch (err) {
        throw err;
    }
};