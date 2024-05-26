if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require("connect-mongo");
const wrapAsync = require("./utils/wrapasync");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const nodemailer = require("nodemailer");
const Student = require("./models/student");
const { studentSchema, recruiterSchema } = require("./schema");
const Recruiter = require("./models/recruiter");
const VerifiedUser = require("./models/verifiedUser");
const OTP = require("./models/otp");
const Listing = require("./models/listing");
const Application = require("./models/application");
const axios = require("axios");
const multer = require("multer");
const flash = require("connect-flash");
const { storage, cloudinary } = require("./cloudConfig");
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
const cron = require("node-cron");

const {
  isAuthenticated,
  isLoggedIn,
  shallNotAuthenticated,
  isVerified,
  isThisAdmin,
  isLoginFieldsFilled,
  studentStayInDashboard,
  isTwoFactorDone,
} = require("./middleware");

const adminRouter = require("./routes/admin");
const accountRouter = require("./routes/account");
const registrationRouter = require("./routes/registration");
const teamRouter = require("./routes/team");
const communityRouter = require("./routes/community");
const resourcesRouter = require("./routes/resources");
const authRouter = require("./routes/authentication");
const { func } = require("joi");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in Mongo Session Store ", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 12 * 60 * 60 * 1000,
    maxAge: 12 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  let int = Math.floor(Math.random() * 10) + 1;
  int *= 100;
  next();
});
passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());
main()
  .then(() => {
    console.log("Connected To db");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}

app.use(isAuthenticated);
app.use(studentStayInDashboard);

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

app.get("/", (req, res) => {
  return res.render("index.ejs", {
    isAuthenticated: res.locals.isAuthenticated,
    isAdmin: res.locals.isAdmin,
  });
});

const checkAndUpdateListings = async () => {
  const currentDate = new Date();

  try {
    const result = await Listing.updateMany(
      { lastDateToApply: { $lte: currentDate }, isDown: false },
      { $set: { isDown: true } }
    );

    console.log(`Listings Downed: ${result}`);
  } catch (error) {
    console.error("Error Downing listings:", error);
  }
};

cron.schedule("0 * * * *", () => {
  console.log("Running scheduled task to Down listings...");
  checkAndUpdateListings();
});

//login:auth
app.use("/auth", authRouter);
app.use("/register/:user", registrationRouter);
app.use("/account", accountRouter);
app.use("/admin", adminRouter);
app.use("/placement-team", teamRouter);
app.use("/community", communityRouter);
app.use("/resources", resourcesRouter);

//Outsourced html page's favicon's abrupt request handler
app.get("/favicon.ico", (req, res) => {
  return res.status(200);
});

app.all("*", (req, res) => {
  // to not get path not found on /fevicon.ico in admin page (inadequate behaviour by admin page )
  if (req.user && req.user.username == process.env.ADMIN_USERNAME) {
    return res.redirect("/");
  } else {
    req.flash("error", "Page Not Found !", req.path);
    return res.redirect("/");
  }
});
