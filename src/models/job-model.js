const db = require('../config/db');

const createJob = async(postID, hourlyRate, contract, weeklyHours) => {
    try {
        await db.execute('INSERT INTO Job (PostID, HourlyRate, Contract, WeeklyHours) VALUES (?, ?, ?, ?)', 
            [postID, hourlyRate, contract, weeklyHours]);
    }
    catch (err) {
        throw err;
    }
};

const fetchAll = async() => {
    try {
        const [result] = await db.query('SELECT * FROM Job JOIN Post ON Job.PostID = Post.PostID WHERE Post.StartDate > CURDATE()');
        if (result.length === 0) {
            return null;
        }
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
};

module.exports = {
    createJob,
    fetchAll
}