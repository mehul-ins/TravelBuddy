if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const MONGO_URL = process.env.MONGO_URI;
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require('./models/user.js');

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// Connecting MongoDB
main().then(() => {
    console.log("Database Connected");
}).catch((err) =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

// Set engine and use enginer
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(cookieParser("secretcode"));

const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//serialize 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); 
  res.locals.currUser = req.user;
  next();
});
// app.get("/getsingedcookie", (req, res) =>{
//     res.cookie("name", "mehul", {signed : true});
//     res.send("signed cookie sent");
// });

// app.get("/verify", (req, res) => {
//     console.log(req.signedCookies);
//     res.send("verified")
// });

// Root Route -> All Listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Listings
app.use("/listings", listingsRouter);

// Reviews
app.use("/listings/:id/reviews", reviewsRouter);

// User 
app.use("/", userRouter);


// Error - 404
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "404 Page Not Found!"));
});

//Error Handler
app.use((err, req, res, next) => {
   const { statusCode = 500, message = "something went wrong!" } = err;
   res.status(statusCode).render("error.ejs", { message });
});

// Connecting Port
app.listen(port, () => {
    console.log("Port Connected");
});