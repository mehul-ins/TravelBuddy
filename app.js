if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/airbnb";
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require('./models/user.js');

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MongoDB connection with better error handling
mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("✅ MongoDB Connected Successfully");
}).catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Don't exit - let app start anyway for debugging
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

// Set engine and use enginer
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Required for secure cookies behind Render/HTTPS proxy
app.set('trust proxy', 1);

app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(cookieParser(process.env.COOKIE_SECRET || "secretcode"));

// MongoDB-backed session store for production
const sessionStore = MongoStore.create({
    mongoUrl: MONGO_URL,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,  // 14 days
});

const sessionOptions = {
    store: sessionStore,
    secret : process.env.SESSION_SECRET || "mysupersecretcode",
    resave : false,
    saveUninitialized : false,
    proxy: true,
    cookie : {
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
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

// Health and session diagnostics
app.get('/healthz', (req, res) => res.status(200).send('ok'));
app.get('/session-check', (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionID: req.sessionID || null,
    user: req.user ? { id: req.user._id, username: req.user.username } : null,
  });
});

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

// Export for Vercel (serverless)
module.exports = app;

// Connect port when running in non-Vercel environments (e.g., Render/local)
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}