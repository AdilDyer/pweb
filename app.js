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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Student = require("./models/student");
const OTP = require("./models/otp");
const Listing = require("./models/listing");
const flash = require("connect-flash");
const cron = require("node-cron");
const { isAuthenticated, studentStayInDashboard } = require("./middleware");
const adminRouter = require("./routes/admin");
const accountRouter = require("./routes/account");
const registrationRouter = require("./routes/registration");
const teamRouter = require("./routes/team");
const communityRouter = require("./routes/community");
const resourcesRouter = require("./routes/resources");
const authRouter = require("./routes/authentication");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store ", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  //to save session each time
  resave: true,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 12 * 60 * 60 * 1000,
    maxAge: 12 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//to manually apply flash messages
// app.use((req, res, next) => {
//   // Initialize flash object if it doesn't exist
//   if (!req.session.flash) {
//     req.session.flash = {};
//   }
//   // Store flash messages in res.locals and clear them from session
//   res.locals.success = req.session.flash.success || null;
//   res.locals.error = req.session.flash.error || null;

//   // Clear flash messages after use
//   req.session.flash = {};

//   next();
// });
// // Custom function to set flash messages
// app.use((req, res, next) => {
//   req.flash = (type, message) => {
//     if (type === "success" || type === "error") {
//       req.session.flash[type] = message;
//     }
//   };
//   next();
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

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
  console.log(
    "Running scheduled task to Down listings at the start of every hour...."
  );
  checkAndUpdateListings();
});

const deleteExpiredOTPs = async () => {
  const currentDate = new Date();

  try {
    const result = await OTP.deleteMany({
      expirationTime: { $lte: currentDate },
    });
    console.log(`Expired OTPs deleted: ${result.deletedCount}`);
  } catch (error) {
    console.error("Error deleting expired OTPs:", error);
  }
};

cron.schedule("0 * * * *", () => {
  console.log(
    "Running scheduled task to delete expired OTPs at the start of every hour..."
  );
  deleteExpiredOTPs();
});

app.use("/auth", authRouter);
app.use("/register/:user", registrationRouter);
app.use("/account", accountRouter);
app.use("/admin", adminRouter);
app.use("/placement-team", teamRouter);
app.use("/community", communityRouter);
app.use("/resources", resourcesRouter);

//error handling route
// app.use((err, req, res, next) => {
//   if (err) {
//     res.send("Error : "+ err);
//   }
//   return next();
// });

app.all("*", (req, res) => {
  if (req.user && req.user.username == process.env.ADMIN_USERNAME) {
    req.flash("error", "Page Not Found !", req.path);
    return res.redirect("/admin");
  } else {
    req.flash("error", "Page Not Found !", req.path);
    return res.redirect("/");
  }
});
