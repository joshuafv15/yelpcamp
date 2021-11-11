if (process.env.NODE_ENV !== "production") {
  //This line requires the env file only if we are in production mode.
  require("dotenv").config();
}

//require all the packages, middlewares and modules needed to run this app.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const { helmetMiddleware } = require("./utils/helmetConfig");
const MongoStore = require("connect-mongo");

//Database to use. If youre going to deploy switch the commented line (proccess.env bla bla) to a non commented and comment the below line

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/museums";
//const dbUrl = 'mongodb://localhost:27017/museums';

//setting up the routes for the different route files.
const userRoutes = require("./routes/users");
const museumRoutes = require("./routes/museums");
const reviewRoutes = require("./routes/reviews");

//process to connect to the mongo db, weather its the atlas one or the one in our machine
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  secret,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, this line is for deploy only
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

//handy middleware.. configuring the session, setting up flash and using the helmet extension that we refactored to the utils file
app.use(session(sessionConfig));
app.use(flash());
app.use(helmetMiddleware);

//passport extension
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//prolly could've sent this code to another file but its just not worth it as its just a simple middleware to add flash command.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//connecting to the mongo db
// process.env.DB_URL; for deploy
//'mongodb://localhost:27017/museums' for development

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("We're connencted");
});

//setting up ejs and the views folder for ejs files.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //This is to parse the req.body in post method forms
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(mongoSanitize());

//simplifying or refactoring the calling of the routes as all the routes in each file start by that
app.use("/", userRoutes);
app.use("/museums", museumRoutes);
app.use("/museums/:id/reviews", reviewRoutes);

//root page request

app.get("/", (req, res) => {
  res.render("home");
});

//middleware to catch and throw errors and status codes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

//setting the port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
