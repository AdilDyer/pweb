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
  .post(isThisAdmin, wrapAsync(adminController.arrayMarkRecAudit));

router.route("/addcompanylisting").post(
  isThisAdmin,
  // upload.fields([{ name: "jobDescriptionFile", maxCount: 5 }]),
  upload.any(),
  wrapAsync(adminController.addCompanyListing)
);

router
  .route("/listingDetails/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.showListingDetails));

router
  .route("/updateListing/:listingId")
  .post(isThisAdmin, upload.any(), wrapAsync(adminController.updateListing));
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
  .post(isThisAdmin, wrapAsync(adminController.markQueryResolved));

router
  .route("/arrayMarkAsResolved/:applicationId")
  .post(isThisAdmin, wrapAsync(adminController.arrayMarkQueryResolved));

router
  .route("/updateApplicationStatus/:applicationId")
  .post(isThisAdmin, wrapAsync(adminController.updateApplicationStatus));

router
  .route("/arrayUpdateApplicationStatus/:applicationId")
  .post(isThisAdmin, wrapAsync(adminController.arrayUpdateApplicationStatus));

router
  .route("/toggleRegis/:user")
  .get(isThisAdmin, wrapAsync(adminController.toggleRegisProcess));

router
  .route("/PlacementCellReport")
  .get(wrapAsync(adminController.renderAdminReportPdf));

router.route("/showAdminReport").get(adminController.showAdminReportEjs);

module.exports = router;
