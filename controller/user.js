const User = require("../models/user.js");

// SIGNUP GET - Show signup form
module.exports.signupForm = (req, res) => {
    res.render('users/signup.ejs');
};

// SIGNUP POST - Register new user
module.exports.signup = async(req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to TravelBuddy");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// LOGIN GET - Show login form
module.exports.loginForm = (req, res) => {
    res.render('users/login.ejs');
};

// LOGIN POST - Authenticate user (handled by passport middleware)
module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back to TravelBuddy");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// LOGOUT - Logout user
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
};
