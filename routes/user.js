const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/user');
const wrapAsync = require("../utils/wrapAsync");
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
router.get("/signup", (req, res) => {
    res.render('users/signup.ejs');
});

router.post(
    "/signup", 
    wrapAsync(async (req, res)=> {
    try { 
        let { username, email, password } = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(resgisteredUser, (err) => {
          if (err) {
            return next(err);
          }
          req.flash("successs", "Welcome to Airbnb");
          res.redirect("/listings");
        });
        
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup")
      }
}));

router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

router.post('/login', passport.authenticate('local', {failureRedirect : '/login', failureFlash: true}), saveRedirectUrl,async(req, res) => {
    req.flash("successs", 'Welcome Back to Airbnb');
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
});
module.exports = router;
