const jobModel = require('../models/job-model');
const postController = require('./post-controller');

exports.postJob = async (req, res) => {
    const userID = res.locals.user.UserID;
    const {title, description, location, startDate, endDate, hourlyRate, contract, weeklyHours} = req.body;
    try {
        const postID = await postController.createPost(userID, title, description, location, startDate, endDate, 'Job');
        await jobModel.createJob(postID, hourlyRate, contract, weeklyHours);
        res.redirect('/jobs'); 
    }
    catch (err) {
        throw err;
    }
};

exports.fetchAll = async (req, res) => {
    try {
        const jobs = await jobModel.fetchAll();
        return jobs;
    }
    catch (err) {
        throw err;
    }
};