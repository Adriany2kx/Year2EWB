const userModel = require('../models/user-model');

const bcrypt = require('bcrypt');
const {check, validationResult} = require("express-validator");

exports.login = async (req, res) => {
    const identifier = req.body.identifier;
    const password = req.body.password;
    const language = res.locals.language;
    const login = require(`../json/${language}/login.json`);
    try {
        const user = await userModel.findUser(identifier);
        if(!user) {
            return res.render('../src/views/pages/login', {
                login,
                errorMessage: "Invalid credentials: username or email not found"
            });
        }
        const match = await bcrypt.compare(password, user.Password);
        if(!match) {
            return res.render('../src/views/pages/login', {
                login,
                errorMessage: "Invalid credentials: password incorrect"
            });
        }
        req.session.user = user;
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
        res.render('../src/views/pages/login', {
            login,
            errorMessage: "Something went wrong, please try again"
        });
    }
};

exports.signup = [
    check('username').notEmpty().isLength({ min: 3 }).withMessage('Invalid credentials: username must be at least 3 characters long'),
    check('password').notEmpty().isLength({ min: 3 }).withMessage('Invalid credentials: password must be at least 3 characters long'),
    async (req, res) => {
    const username = req.body.username;
    const forename = req.body.forename;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    const language = res.locals.language;
    const signup = require(`../json/${language}/signup.json`);
    if (!errors.isEmpty()) {
    const alerts = errors.array();
    return res.render('../src/views/pages/signup', {
                signup,
                alerts: alerts
            });
    }
    try {
        const foundUsername = await userModel.findUser(username);
        const foundEmail = await userModel.findUser(email);
        if(foundUsername || foundEmail) {
            return res.render('../src/views/pages/signup', {
                signup,
                errorMessage: "Invalid credentials: username or email already used"
            });
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        await userModel.createUser(username, forename, surname, email, hash);
        res.redirect('/users/login');
    }
    catch (err) {
        console.log(err);
        res.render('../src/views/pages/signup', {
            signup,
            errorMessage: "Something went wrong, please try again"
        });
    }
}];

// In a real system this would use a code from an email or a text
exports.resetPassword = async (req, res) => {
    const identifier = req.body.identifier;
    const newPassword = req.body.newPassword;
    const newPasswordConfirmation = req.body.newPasswordConfirmation;
    const language = res.locals.language;
    const resetPassword = require(`../json/${language}/resetPassword.json`);
    try {
        if(newPassword !== newPasswordConfirmation) {
            res.render('../src/views/pages/reset-password', {
                resetPassword,
                errorMessage: "Password does not match, please try again"
            });
        }
        else {
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            await userModel.changePassword(identifier, hash);
            res.redirect('/users/login');
        }
    }
    catch (err) {
        console.log(err);
        res.render('../src/views/pages/reset-password', {
            resetPassword,
            errorMessage: "Something went wrong, please try again"
        });
    }
};

exports.deleteUser = async(req, res) => {
    const userID = res.locals.user.UserID;
    try {
        await userModel.deleteUser(userID);
        res.redirect('/users/logout');
    }
    catch (err) {
        console.log(err);
    }
};

// Render profile page
exports.getProfile = async (req, res) => {
    if (!res.locals.loggedIn) {
        return res.redirect('/users/login');
    }
    const language = res.locals.language;
    const profile = require(`../json/${language}/profile.json`);
    // Fetch user info from session or DB if needed
    res.render('../src/views/pages/profile', {
        user: res.locals.user,
        profile: profile,
        profileUpdateSuccess: false, // Always defined for EJS
        profileUpdateMessage: '' // Always defined for EJS
    });
};

// Update profile info
exports.updateProfile = async (req, res) => {
    if (!req.session.user || !req.session.user.UserID) {
        // Session expired or user not logged in
        return res.redirect('/users/login');
    }
    const language = res.locals.language;
    const profile = require(`../json/${language}/profile.json`);
    if (!req.body) {
        // This should never happen if bodyParser is working, but handle gracefully
        return res.render('../src/views/pages/profile', {
            user: req.session.user || {},
            profile: profile,
            profileUpdateSuccess: false,
            profileUpdateMessage: 'Form submission error: no data received.',
            keepEditProfileModalOpen: true
        });
    }
    try {
        // Sanitize and trim input
        const forename = req.body.forename ? req.body.forename.trim() : '';
        const surname = req.body.surname ? req.body.surname.trim() : '';
        const username = req.body.username ? req.body.username.trim() : '';
        const dob = req.body.dob ? req.body.dob : null;
        const email = req.body.email ? req.body.email.trim() : '';

        // Only update fields that are not empty and have changed
        const updateData = {};
        if (forename && forename !== req.session.user.Forename) updateData.forename = forename;
        if (surname && surname !== req.session.user.Surname) updateData.surname = surname;
        if (username && username !== req.session.user.Username) updateData.username = username;
        if (dob && dob !== (req.session.user.DOB ? req.session.user.DOB.toISOString ? req.session.user.DOB.toISOString().split('T')[0] : req.session.user.DOB : '')) updateData.dob = dob;
        if (email && email !== req.session.user.Email) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            return res.render('../src/views/pages/profile', {
                user: req.session.user || {},
                profile: profile,
                profileUpdateSuccess: false,
                profileUpdateMessage: 'No changes to update.',
                keepEditProfileModalOpen: true
            });
        }

        // Debug: log the incoming form data and updateData
        console.log('Profile update POST body:', req.body);
        console.log('Profile updateData:', updateData);

        await userModel.updateUser(req.session.user.UserID, updateData);
        // Fetch updated user from DB and update session
        const updatedUser = await userModel.findUser(updateData.username || req.session.user.Username);
        req.session.user = updatedUser;
        res.render('../src/views/pages/profile', {
            user: req.session.user || {},
            profile: profile,
            profileUpdateSuccess: true,
            profileUpdateMessage: 'Profile updated successfully.',
            keepEditProfileModalOpen: true,
            keepChangePasswordModalOpen: false,
            keepNotificationModalOpen: false,
            keepLanguageModalOpen: false
        });
    } catch (err) {
        console.error('Profile update error:', err);
        let errorMsg = 'Error updating profile.';
        if (err && err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage && err.sqlMessage.includes('Username')) {
                errorMsg = 'That username is already taken.';
            } else if (err.sqlMessage && err.sqlMessage.includes('Email')) {
                errorMsg = 'That email is already in use.';
            }
        }
        res.render('../src/views/pages/profile', {
            user: req.session.user || {},
            profile: profile,
            profileUpdateSuccess: false,
            profileUpdateMessage: errorMsg,
            keepEditProfileModalOpen: true
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const user = req.session.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const language = res.locals.language;
    const profile = require(`../json/${language}/profile.json`);
    if (!user) return res.redirect('/users/login');
    if (newPassword !== confirmPassword) {
        return res.render('../src/views/pages/profile', {
            user,
            profile,
            errorMessage: 'Passwords do not match.',
            profileUpdateSuccess: false,
            profileUpdateMessage: '',
            keepEditProfileModalOpen: false,
            keepChangePasswordModalOpen: true,
            keepNotificationModalOpen: false,
            keepLanguageModalOpen: false
        });
    }
    const match = await bcrypt.compare(currentPassword, user.Password);
    if (!match) {
        return res.render('../src/views/pages/profile', {
            user,
            profile,
            errorMessage: 'Current password is incorrect.',
            profileUpdateSuccess: false,
            profileUpdateMessage: '',
            keepEditProfileModalOpen: false,
            keepChangePasswordModalOpen: true,
            keepNotificationModalOpen: false,
            keepLanguageModalOpen: false
        });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    // await userModel.changePassword(user.Username, hash);
    user.Password = hash;
    req.session.user = user;
    res.redirect('/profile');
};

// Update notification preferences
exports.updateNotifications = async (req, res) => {
    // Save notification preferences to DB or session
    req.session.user.notifications = req.body;
    const language = res.locals.language;
    const profile = require(`../json/${language}/profile.json`);
    res.render('../src/views/pages/profile', {
        user: req.session.user || {},
        profile: profile,
        profileUpdateSuccess: true,
        profileUpdateMessage: 'Notification preferences updated successfully.',
        keepEditProfileModalOpen: false,
        keepChangePasswordModalOpen: false,
        keepNotificationModalOpen: true,
        keepLanguageModalOpen: false
    });
};

// Update language preference
exports.updateLanguage = async (req, res) => {
    req.session.language = req.body.language;
    const language = res.locals.language;
    const profile = require(`../json/${language}/profile.json`);
    res.render('../src/views/pages/profile', {
        user: req.session.user || {},
        profile: profile,
        profileUpdateSuccess: true,
        profileUpdateMessage: 'Language preference updated successfully.',
        keepEditProfileModalOpen: false,
        keepChangePasswordModalOpen: false,
        keepNotificationModalOpen: false,
        keepLanguageModalOpen: true
    });
};
exports.getUsername = (req, res) => {
    if (req.session.user && req.session.user.Username) {
        res.send(req.session.user.Username); // Send the username as plain text
    } else {
        res.status(401).send('User not logged in'); // Handle cases where the user is not logged in
    }
};