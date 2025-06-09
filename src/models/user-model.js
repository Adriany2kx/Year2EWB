const db = require('../config/db');

// Password should be hashed before insertion
const createUser = async(username, forename, surname, email, password) => {
    try {
        await db.execute('INSERT INTO User (Username, Forename, Surname, Email, Password) VALUES (?, ?, ?, ?, ?)', 
            [username, forename, surname, email, password]);
    }
    catch (err) {
        throw err;
    }
};

const deleteUser = async(userID) => {
    try {
        await db.execute('DELETE FROM User WHERE UserID = ?', [userID]);
    }
    catch (err) {
        throw err;
    }
};

// For getting a user by username or email (logging in)
const findUser = async(identifier) => {
    const [user] = await db.execute('SELECT * FROM User WHERE Username = ? OR Email = ?', [identifier, identifier]);
    if (user.length === 0) {
        return null;
    }
    return user[0];
};

// For password reset
const changePassword = async(identifier, password) => {
    try {
        await db.execute('UPDATE User SET password = ? WHERE Username = ? OR Email = ?', [password, identifier, identifier]);
    }
    catch (err) {
        throw err;
    }
};

// Update user info (add this function for demo, extend as needed)
const updateUser = async (userID, data) => {
    // Only update allowed fields
    const fields = [];
    const values = [];
    if (data.forename) { fields.push('Forename = ?'); values.push(data.forename); }
    if (data.surname) { fields.push('Surname = ?'); values.push(data.surname); }
    if (data.username) { fields.push('Username = ?'); values.push(data.username); }
    if (data.dob) { fields.push('DOB = ?'); values.push(data.dob); }
    if (data.email) { fields.push('Email = ?'); values.push(data.email); }
    if (fields.length === 0) return false;
    const sql = `UPDATE User SET ${fields.join(', ')} WHERE UserID = ?`;
    values.push(userID);
    await db.execute(sql, values);
    return true;
};

module.exports = {
    createUser,
    deleteUser,
    findUser,
    changePassword,
    updateUser
};