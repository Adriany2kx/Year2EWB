const postModel = require('../models/post-model');

exports.createPost = async (userID, title, description, location, startDate, endDate, type) => {
    try {
        const [result] = await postModel.createPost(userID, title, description, location, startDate, endDate, type);
        return result.PostID;
    }
    catch (err) {
        throw err;
    }
};