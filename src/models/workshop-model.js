const db = require('../config/db');

// inserts a new workshop row
const createWorkshop = async (postID, date, remainingSlots) => {
    try {
        await db.execute(
            'INSERT INTO Workshop (PostID, Date, RemainingSlots) VALUES (?, ?, ?)',
            [postID, date, remainingSlots]
        );
    } catch (err) {
        throw err;
    }
};

// gets workshops based on search/filter
const fetchFiltered = async (searchTerm, filterOption) => {
    try {
        let baseQuery = `
            SELECT Workshop.*, Post.*, User.Email
            FROM Workshop
            JOIN Post ON Workshop.PostID = Post.PostID
            JOIN User ON Post.UserID = User.UserID
            WHERE Post.Type = 'Workshop'
              AND Post.ApplyBy >= CURDATE()
        `;
        const parameters = [];

        // search by title or description if searchTerm exists
        if (searchTerm) {
            baseQuery += ` AND (Post.Title LIKE ? OR Post.Description LIKE ?)`;
            parameters.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // choose how to sort results
        if (filterOption === "Date posted") {
            baseQuery += ` ORDER BY Post.TimeCreated DESC`;
        } else if (filterOption === "Date") {
            baseQuery += ` ORDER BY Workshop.Date ASC`;
        } else if (filterOption === "Slots remaining") {
            baseQuery += ` ORDER BY Workshop.RemainingSlots DESC`;
        }

        const [result] = await db.query(baseQuery, parameters);
        return result || [];
    } catch (err) {
        console.log(err);
        return [];
    }
};

// removes workshop and its post by postID
const deleteWorkshop = async (postID) => {
    try {
        await db.execute('DELETE FROM Workshop WHERE PostID = ?', [postID]);
        await db.execute('DELETE FROM Post WHERE PostID = ?', [postID]);
    } catch (err) {
        console.error('error in deleteWorkshop:', err);
        throw new Error('failed to delete workshop');
    }
};

module.exports = {
    createWorkshop,
    fetchFiltered,
    deleteWorkshop
};