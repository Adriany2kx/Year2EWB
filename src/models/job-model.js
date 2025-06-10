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

const fetchFiltered = async(searchTerm, filterOption) => {
    try {
        let baseQuery = `
        SELECT Job.*, Post.*, User.Email
        FROM Job
        JOIN Post ON Job.PostID = Post.PostID
        JOIN User ON Post.UserID = User.UserID
        WHERE Post.ApplyBy >= CURDATE()
        `;
        const parameters = [];
        if (searchTerm) {
            baseQuery += `AND (Post.Title LIKE ? OR Post.Description LIKE ?)`;
            parameters.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
        if (filterOption && filterOption !== "Date posted" && filterOption !== "Hourly rate") {
            baseQuery += `AND Job.Contract = ?`;
            parameters.push(filterOption);
        }
        if (filterOption === "Date posted") {
            baseQuery += `ORDER BY Post.TimeCreated DESC`;
        } 
        else if (filterOption === "Hourly rate") {
            baseQuery += `ORDER BY Job.HourlyRate DESC`;
        }
        const [result] = await db.query(baseQuery, parameters);
        return result.length ? result : null;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
};

module.exports = {
    createJob,
    fetchFiltered
}