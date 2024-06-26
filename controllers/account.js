const Student = require("../models/student");
const Listing = require("../models/listing");
const Application = require("../models/application");
const Update = require("../models/update");
const Recruiter = require("../models/recruiter");
const Query = require("../models/query");
module.exports.showAccount = async (req, res) => {
  let { isRegistered, _id, course } = req.user;

  const allListings = await Listing.find({ isDown: false });

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

    //conditions on available listings accor to placement status of the student
    let availableListings = "";
    if (req.user.isPlaced) {
      if (req.user.placedJobType == "Internship") {
        availableListings = filteredOnAppliedListings.filter(
          (listing) =>
            (listing.forCourse.includes(course) ||
              listing.forCourse.includes("All")) &&
            (listing.jobType == "FTE" || listing.isDreamOffer == true)
        );
      } else if (req.user.placedJobType == "Intern FTE") {
        availableListings = filteredOnAppliedListings.filter(
          (listing) =>
            (listing.forCourse.includes(course) ||
              listing.forCourse.includes("All")) &&
            (listing.jobType != "Internship" || listing.isDreamOffer == true)
        );
      } else if (req.user.placedJobType == "FTE") {
        availableListings = filteredOnAppliedListings.filter(
          (listing) =>
            (listing.forCourse.includes(course) ||
              listing.forCourse.includes("All")) &&
            (listing.jobType == "Internship" || listing.isDreamOffer == true)
        );
      } else if (req.user.placedJobType == "Internship PPO") {
        availableListings = filteredOnAppliedListings.filter(
          (listing) =>
            (listing.forCourse.includes(course) ||
              listing.forCourse.includes("All")) &&
            (listing.jobType == "NULL" || listing.isDreamOffer == true)
        );
      }
    } else {
      availableListings = filteredOnAppliedListings.filter(
        (listing) =>
          listing.forCourse.includes(course) ||
          listing.forCourse.includes("All")
      );
    }

    let allUpdates = await Update.find({});
    let updatesToShow = allUpdates.filter(
      (update) =>
        update.forCourse.includes(course) || update.forCourse.includes("All")
    );
    let countAvailableListings = availableListings.length;
    let countAppliedListings = appliedListings.length;

    return res.render("users/youraccountstu.ejs", {
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
      studentApplications: studentApplications,
      stuDetails: req.user,
    });
  } catch (err) {
    console.error("Error retrieving student applications:", err);
    return res.redirect("/account");
  }
};

module.exports.showStuPlacementProfile = async (req, res) => {
  let { stuId } = req.query;
  let adminUsername = process.env.ADMIN_USERNAME;
  if (req.user._id == stuId || req.user.username == adminUsername) {
    let stuDetails = await Student.findOne({ _id: stuId });
    return res.render("resources/studentDetails.ejs", {
      stuDetails: stuDetails,
      isRegistered: stuDetails.isRegistered,
      profilePictureUrl: req.user.profilePictureUrl,
      stuId: stuDetails._id,
    });
  } else {
    req.flash("error", "Invalid Student Id !");
    await req.session.save();

    return res.redirect("/account");
  }
};

module.exports.renderApplyForm = async (req, res) => {
  let { listingId, stuId } = req.query;
  let stuDetails = await Student.findOne({ _id: stuId });
  let listingDetails = await Listing.findOne({ _id: listingId });

  if (stuDetails && listingDetails) {
    if (stuDetails.isDeboarded) {
      req.flash(
        "error",
        "Your Account has been Disabled by the Admin. Please Contact the Administration for further Information."
      );
      return res.redirect("/account");
    }
  } else {
    req.flash("error", "Invalid Student or Listing Id !");
    return res.redirect("/account");
  }
  return res.render("resources/apply.ejs", {
    listingId: listingId,
    stuId: stuId,
    stuDetails: stuDetails,
    companyname: listingDetails.companyName,
    jobType: listingDetails.jobType,
  });
};

module.exports.submitApply = async (req, res) => {
  let { listingId, stuId } = req.body;
  //let resumeLink = upload file
  let resumeLink = req.file.path;
  let listingDetails = await Listing.findOne({ _id: listingId });

  let prevapp = await Application.find({
    stuId: stuId,
    listingId: listingId,
  });
  if (prevapp.length != 0) {
    req.flash("error", "Already Applied !");
    return res.redirect("/account");
  } else {
    // if (req.user.isPlaced && listingDetails.isDreamOffer == false) {
    //   req.flash(
    //     "error",
    //     "Placed Students cant apply for Non-Dream Companies !"
    //   );
    //   res.redirect("/account");
    // }
    if (req.user.isDeboarded) {
      req.flash(
        "error",
        "Your Account has been Disabled by the Admin. Please Contact the Administration for further Information."
      );
      return res.redirect("/account");
    }
    let newApplication = new Application({
      stuId: stuId,
      listingId: listingId,
      resumeLink: resumeLink,
      createdAt: new Date(),
    });

    await newApplication.save();

    req.flash("success", "Application Submitted Succesfully !");
    return res.redirect("/account");
  }
};

module.exports.renderQueryForm = async (req, res) => {
  let allQueries = await Query.find({ stuId: req.user._id });

  return res.render("resources/askquery.ejs", {
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
    return res.redirect("/account/askqueries");
  }
  let newQuery = new Query({
    subject: subject,
    query: query,
    stuId: req.user._id,
  });

  await newQuery.save();

  req.flash("success", "Query Submitted Successfully !");
  req.session.save();

  return res.redirect("/account/askqueries");
};
