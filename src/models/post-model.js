const db = require('../config/db');

const createPost = async(userID, title, description, location, startDate, applyBy, type) => {
    try {
        const [result] = await db.execute('INSERT INTO Post (UserID, Title, Description, Location, StartDate, ApplyBy, Type) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [userID, title, description, location, startDate, applyBy, type]
        );
        return result.insertId;
    }
    catch (err) {
        throw err;
    }
};

module.exports = {
    createPost
}