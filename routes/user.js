const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const userController = require("../controller/user.js");

// SIGNUP ROUTES
router.get("/signup", userController.signupForm);
router.post("/signup", wrapAsync(userController.signup));

// LOGIN ROUTES
router.get('/login', userController.loginForm);
router.post(
    '/login', 
    passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), 
    saveRedirectUrl,
    wrapAsync(userController.login)
);

// LOGOUT ROUTE
router.get("/logout", userController.logout);

module.exports = router;
