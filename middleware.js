const wrapAsync = require("./utils/wrapasync");
const VerifiedUser = require("./models/verifiedUser");
const OTP = require("./models/otp");
const Recruiter = require("./models/recruiter");
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true;
    res.locals.isAdmin = req.user.username == process.env.ADMIN_USERNAME;
    
  } else {
    res.locals.isAuthenticated = false;
    res.locals.isAdmin = false;
  }
  next();
};

module.exports.isLoggedIn = wrapAsync(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first !");
    res.redirect("/");
  } else {
    return next();
  }
});

module.exports.shallNotAuthenticated = wrapAsync(async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAudited == true) {
      return next();
    } else {
      req.flash("error", "You Must Log out First !");
      res.redirect("/");
    }
  } else {
    return next();
  }
});

module.exports.isThisAdmin = (req, res, next) => {
  if (res.locals.isAdmin == true) {
    return next();
  } else {
    req.flash("error", "You Must be Admin to access Admin Page !");
    res.redirect("/");
  }
};

module.exports.isLoginFieldsFilled = (req, res, next) => {
  if (req.session.bodyData.username == "Student") {
    if (
      req.session.bodyData.stuname &&
      req.session.bodyData.enrollnostu &&
      req.session.bodyData.email &&
      req.session.bodyData.stumobno &&
      req.session.bodyData.coursename
    ) {
      return next();
    } else {
      req.flash("error", "Please Provide all Login Details !");
      res.redirect("/otp-verify-page");
    }
  } else if (req.session.bodyData.email) {
    return next();
  } else {
    req.flash("error", "Please Provide all Login Details !");
    res.redirect("/otp-verify-page");
  }
};

module.exports.studentStayInDashboard = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    res.locals.isAdmin == false &&
    !(req.path === "/account") &&
    !(req.path === "/auth/logout") &&
    !(req.path === "/register/stu") &&
    !(req.path == "/account/sturegisdetails/") &&
    !(req.path == "/account/apply") &&
    !(req.path == "/account/askqueries")
  ) {
    res.redirect("/account");
  } else {
    return next();
  }
};

module.exports.isTwoFactorDone = wrapAsync(async (req, res, next) => {
  let result = await OTP.findOne({
    email: req.session.email,
    code: req.body.otp,
  });
  if (result) {
    await OTP.deleteMany({ email: req.session.email });
    return next();
  } else {
    req.flash("error", "Please Enter Correct OTP.");
    res.redirect("/auth/login-student/verifyotp");
  }
});
