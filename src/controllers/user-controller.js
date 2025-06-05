const userModel = require('../models/user-model');

const bcrypt = require('bcrypt');
const {check, validationResult} = require("express-validator");

const login = require('../json/english/login.json');
const signup = require('../json/english/signup.json');

exports.login = async (req, res) => {
    const identifier = req.body.identifier;
    const password = req.body.password;
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