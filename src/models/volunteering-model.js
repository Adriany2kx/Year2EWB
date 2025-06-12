const db = require('../config/db');

//retrieve 'volunteer' type posts and check if user has joined each one 
async function getAllVolunteerEvents(userId) {
    const query = `
        SELECT p.PostID, p.Title, p.Description, p.Location, p.StartDate, p.ApplyBy, v.Points,
               p.UserID AS CreatorID,
               (SELECT 1 FROM synoptic.Application a WHERE a.UserID = ? AND a.PostID = p.PostID) AS joined
        FROM synoptic.Post p
        JOIN synoptic.Volunteer v ON p.PostID = v.PostID
        WHERE p.Type = 'Volunteer'
        ORDER BY p.TimeCreated DESC;
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
}

//add user to volunteer post and update points
async function joinVolunteerEvent(userId, postId) {
    const checkQuery = `SELECT * FROM synoptic.Application WHERE UserID = ? AND PostID = ?;`;
    const insertQuery = `INSERT INTO synoptic.Application (UserID, PostID) VALUES (?, ?);`;
    const pointsQuery = `SELECT Points FROM synoptic.Volunteer WHERE PostID = ?;`;
    const updatePointsQuery = `
        UPDATE synoptic.User
        SET CredibilityPoints = CredibilityPoints + ?
        WHERE UserID = ?;
    `;

    const [checkRows] = await db.query(checkQuery, [userId, postId]);
    if (checkRows.length === 0) {
        await db.query(insertQuery, [userId, postId]);
        const [pointsRes] = await db.query(pointsQuery, [postId]);
        const points = pointsRes[0]?.Points || 0; //default 0 points if not provided for that post
        await db.query(updatePointsQuery, [points, userId]);
    }
}

//create volunteer type post
async function createVolunteerEvent(data) {
    const postInsertQuery = `
        INSERT INTO synoptic.Post (UserID, Title, Description, Location, StartDate, ApplyBy, Type)
        VALUES (?, ?, ?, ?, ?, ?, 'Volunteer');
    `;
    const volunteerInsertQuery = `
        INSERT INTO synoptic.Volunteer (PostID, \`Date\`, Points) VALUES (?, ?, ?);
    `;

    const [postResult] = await db.query(postInsertQuery, [
        data.userId,
        data.title,
        data.description,
        data.location,
        data.startDate,
        data.applyBy
    ]);

    const postId = postResult.insertId;
    await db.query(volunteerInsertQuery, [postId, data.startDate, data.points]);
}

//lets user leave volunteer post and deducts points 
async function unjoinVolunteerEvent(userId, postId) {
    const deleteQuery = `DELETE FROM synoptic.Application WHERE UserID = ? AND PostID = ?`;
    const pointsQuery = `SELECT Points FROM synoptic.Volunteer WHERE PostID = ?`;
    const updatePointsQuery = `
        UPDATE synoptic.User
        SET CredibilityPoints = GREATEST(CredibilityPoints - ?, 0)
        WHERE UserID = ?;
    `;

    await db.query(deleteQuery, [userId, postId]);
    const [pointsRes] = await db.query(pointsQuery, [postId]);
    const points = pointsRes[0]?.Points || 0;
    await db.query(updatePointsQuery, [points, userId]);
}

//retrieve data for each post- check who posted it before allowing deletion
async function getVolunteerPost(postId) {
    const [rows] = await db.query(`SELECT * FROM synoptic.Post WHERE PostID = ?`, [postId]);
    return rows[0];
}

//delete volunteering post
async function deleteVolunteerEvent(postId) {
    await db.query(`DELETE FROM synoptic.Post WHERE PostID = ?`, [postId]);
}

//get list of all users who have applied for a volunteering post
async function getApplicantsForPost(postId) {
    const query = `
        SELECT u.UserID, u.Forename, u.Surname, u.Username, u.CredibilityPoints, a.DateApplied
        FROM synoptic.Application a
        JOIN synoptic.User u ON a.UserID = u.UserID
        WHERE a.PostID = ?
        ORDER BY a.DateApplied ASC
    `;
    const [rows] = await db.query(query, [postId]);
    return rows;
}

module.exports = {
    getAllVolunteerEvents,
    joinVolunteerEvent,
    unjoinVolunteerEvent,
    createVolunteerEvent,
    getVolunteerPost,
    deleteVolunteerEvent,
    getApplicantsForPost
};
