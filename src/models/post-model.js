const db = require('../config/db');

const createPost = async(userID, title, description, location, startDate, endDate, type) => {
    try {
        const result = await db.execute('INSERT INTO Post (UserID, Title, Description, Location, StartDate, EndDate, Type) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [userID, title, description, location, startDate, endDate, type]
        );
        return result;
    }
    catch (err) {
        throw err;
    }
};

module.exports = {
    createPost
}