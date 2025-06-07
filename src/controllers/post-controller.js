const postModel = require('../models/post-model');

exports.createPost = async (userID, title, description, location, startDate, applyBy, type) => {
    try {
        const result = await postModel.createPost(userID, title, description, location, startDate, applyBy, type);
        return result;
    }
    catch (err) {
        throw err;
    }
};