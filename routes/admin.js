const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin");
const { isThisAdmin } = require("../middleware");
const wrapAsync = require("../utils/wrapasync");
const { storage } = require("../cloudConfig");
const multer = require("multer");
const Listing = require("../models/listing");
const Application = require("../models/application");
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.route("/").get(isThisAdmin, wrapAsync(adminController.showAdmin));

router
  .route("/recdetails/:recid")
  .get(isThisAdmin, wrapAsync(adminController.showRecDetails));

router
  .route("/recaudited/:recid")
  .get(isThisAdmin, wrapAsync(adminController.markRecAudit));

router
  .route("/arrayMarkRecAudited")
  .post(wrapAsync(adminController.arrayMarkRecAudit));

router.route("/addcompanylisting").post(
  isThisAdmin,
  upload.single("jobDescriptionFile"),
  // upload.fields([{ name: "jobDescriptionFile", maxCount: 5 }]),
  wrapAsync(adminController.addCompanyListing)
);

router
  .route("/listingDetails/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.showListingDetails));

router
  .route("/updateListing/:listingId")
  .post(
    isThisAdmin,
    upload.single("jobDescriptionFile"),
    wrapAsync(adminController.updateListing)
  );
router
  .route("/removefromlisting/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.removeCompanyListing));

router
  .route("/markStuAudit/:verifiedStuID")
  .get(isThisAdmin, wrapAsync(adminController.markStuAudit))
  .post(isThisAdmin, wrapAsync(adminController.markStuArrayAudit));

router
  .route("/deboard/recruiter/:recid")
  .get(isThisAdmin, wrapAsync(adminController.deboardRecruiter));
router
  .route("/deboard/student/:stuid")
  .get(isThisAdmin, wrapAsync(adminController.deboardStudent));

router
  .route("/onboard/recruiter/:recid")
  .get(isThisAdmin, wrapAsync(adminController.onboardRecruiter));
router
  .route("/onboard/student/:stuid")
  .get(isThisAdmin, wrapAsync(adminController.onboardStudent));
router
  .route("/export/student")
  .get(isThisAdmin, wrapAsync(adminController.exportAllStudentData));

router
  .route("/export/company")
  .get(isThisAdmin, wrapAsync(adminController.exportAllCompanyData));

router
  .route("/sendupdate")
  .post(isThisAdmin, wrapAsync(adminController.pushUpdateToStudents));

router
  .route("/deleteupdate/:updateId")
  .get(isThisAdmin, wrapAsync(adminController.deleteUpdate));

router
  .route("/placedstudent/:applicationId")
  .get(isThisAdmin, adminController.renderPlacedStudentForm)
  .post(isThisAdmin, wrapAsync(adminController.markPlacedStudent));

router
  .route("/markqueryresolved/:queryId")
  .post(wrapAsync(adminController.markQueryResolved));

router
  .route("/arrayMarkAsResolved/:applicationId")
  .post(wrapAsync(adminController.arrayMarkQueryResolved));

router
  .route("/updateApplicationStatus/:applicationId")
  .post(wrapAsync(adminController.updateApplicationStatus));

router
  .route("/arrayUpdateApplicationStatus/:applicationId")
  .post(wrapAsync(adminController.arrayUpdateApplicationStatus));

module.exports = router;
