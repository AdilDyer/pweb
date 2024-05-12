const Student = require("../models/student");
const Listing = require("../models/listing");
const Application = require("../models/application");
const Update = require("../models/update");
const Recruiter = require("../models/recruiter");
const Query = require("../models/query");
module.exports.showAccount = async (req, res) => {
  let { isRegistered, _id, course } = req.user;

  const allListings = await Listing.find({});

  try {
    const studentApplications = await Application.find({ stuId: _id });
    const appliedListingIds = studentApplications.map((app) => app.listingId);
    const filteredOnAppliedListings = allListings.filter((listing) => {
      return !appliedListingIds.some((appliedListingId) =>
        appliedListingId.equals(listing._id)
      );
    });
    const appliedListings = allListings.filter((listing) => {
      return appliedListingIds.some((appliedListingId) =>
        appliedListingId.equals(listing._id)
      );
    });
    const availableListings = filteredOnAppliedListings.filter(
      (listing) =>
        listing.forCourse.includes(course) || listing.forCourse.includes("All")
    );

    let allUpdates = await Update.find({});
    let updatesToShow = allUpdates.filter(
      (update) =>
        update.forCourse.includes(course) || update.forCourse.includes("All")
    );
    let countAvailableListings = availableListings.length;
    let countAppliedListings = appliedListings.length;

    res.render("users/youraccountstu.ejs", {
      isRegistered: isRegistered,
      stuId: _id,
      profilePictureUrl: req.user.profilePictureUrl,
      availableListings: availableListings,
      appliedListings: appliedListings,
      updatesToShow: updatesToShow,
      isPlaced: req.user.isPlaced,
      isDeboarded: req.user.isDeboarded,
      countAppliedListings: countAppliedListings,
      countAvailableListings: countAvailableListings,
    });
  } catch (err) {
    console.error("Error retrieving student applications:", err);
    res.redirect("/account");
  }
};

module.exports.showStuPlacementProfile = async (req, res) => {
  let { stuId } = req.query;
  let stuDetails = await Student.findOne({ _id: stuId });

  res.render("resources/studentDetails.ejs", {
    stuDetails: stuDetails,
    isRegistered: stuDetails.isRegistered,
    profilePictureUrl: req.user.profilePictureUrl,
    stuId: stuDetails._id,
  });
};

module.exports.renderApplyForm = async (req, res) => {
  let { listingId, stuId } = req.query;
  let stuDetails = await Student.findOne({ _id: stuId });
  let listingDetails = await Listing.findOne({ _id: listingId });

  if (stuDetails.isPlaced) {
    req.flash("error", "Placed Students cant apply for the Companies !");
    res.redirect("/account");
  }
  if (stuDetails.isDeboarded) {
    req.flash(
      "error",
      "Your Account has been Disabled by the Admin. Please Contact the Administration for further Information."
    );
    res.redirect("/account");
  }
  res.render("resources/apply.ejs", {
    listingId: listingId,
    stuId: stuId,
    stuDetails: stuDetails,
    companyname: listingDetails.companyName,
    jobtitle: listingDetails.jobTitle,
  });
};

module.exports.submitApply = async (req, res) => {
  let { listingId, stuId } = req.body;
  //let resumeLink = upload file
  let resumeLink = req.file.path;

  let prevapp = await Application.find({
    stuId: stuId,
    listingId: listingId,
  });
  if (prevapp.length != 0) {
    req.flash("error", "Already Applied !");
    res.redirect("/account");
  } else {
    let newApplication = new Application({
      stuId: stuId,
      listingId: listingId,
      resumeLink: resumeLink,
      createdAt: new Date(),
    });

    await newApplication.save();

    req.flash("success", "Application Submitted Succesfully !");
    res.redirect("/account");
  }
};

module.exports.renderQueryForm = async (req, res) => {
  let allQueries = await Query.find({ stuId: req.user._id });

  res.render("resources/askquery.ejs", {
    isRegistered: true,
    profilePictureUrl: req.user.profilePictureUrl,
    stuId: req.user._id,
    allQueries: allQueries,
  });
};

module.exports.submitStudentQuery = async (req, res) => {
  let { subject, query } = req.body;

  if (query.split(/\s+/).length > 100) {
    // Splitting by whitespace to count words
    req.flash("error", "Query should be less than 100 words");
    res.redirect("/account/askqueries");
  }
  let newQuery = new Query({
    subject: subject,
    query: query,
    stuId: req.user._id,
  });

  await newQuery.save();

  req.flash("success", "Query Submitted Successfully !");
  req.session.save();
  res.redirect("/account/askqueries");
};
