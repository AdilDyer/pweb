const express = require("express");
const router = express.Router({ mergeParams: true });
const accountController = require("../controllers/account");
const wrapAsync = require("../utils/wrapasync");
const { isLoggedIn } = require("../middleware");
const { storage } = require("../cloudConfig");

const multer = require("multer");
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
router.route("/").get(isLoggedIn, wrapAsync(accountController.showAccount));

router
  .route("/sturegisdetails")
  .get(isLoggedIn, wrapAsync(accountController.showStuPlacementProfile));

router
  .route("/apply")
  .get(wrapAsync(accountController.renderApplyForm))
  .post(upload.single("resumeLink"), wrapAsync(accountController.submitApply));

router
  .route("/askqueries")
  .get(wrapAsync(accountController.renderQueryForm))
  .post(wrapAsync(accountController.submitStudentQuery));

  
module.exports = router;
