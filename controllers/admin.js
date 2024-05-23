const Student = require("../models/student");
const Recruiter = require("../models/recruiter");
const VerifiedUser = require("../models/verifiedUser");
const Listing = require("../models/listing");
const Application = require("../models/application");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const Update = require("../models/update");
const Query = require("../models/query");
const AdminSetting = require("../models/adminsetting");
let converter = require("json-2-csv");
const puppeteer = require("puppeteer");
const path = require("path");

module.exports.showAdmin = async (req, res) => {
  let allRecruitersPending = await Recruiter.find({ isAudited: false });
  let countAllRecruitersPending = allRecruitersPending.length;
  let allStudentsPending = await VerifiedUser.find({
    "bodyData.username": "Student",
  });
  let countallStudentsPending = allStudentsPending.length;
  let allRegisteredRecruiters = await Recruiter.find({
    isRegistered: true,
    isDeboarded: false,
  });
  let countAllRegisteredRecruiters = allRegisteredRecruiters.length;
  let allAuditedRecruiters = await Recruiter.find({
    isAudited: true,
    isRegistered: false,
    isDeboarded: false,
  });
  let allAuditedStudents = await Student.find({
    isAudited: true,
    isRegistered: false,
    isDeboarded: false,
  });
  let countallAuditedStudents = allAuditedStudents.length;
  let allRegisteredStudents = await Student.find({ isRegistered: true });
  let countallRegisteredStudents = allRegisteredStudents.length;
  let allListedRecruiters = await Listing.find({});
  let countAllListedRecruiters = allListedRecruiters.length;
  let allApplications = await Application.find({})
    .populate("stuId")
    .populate("listingId");
  let countallApplications = allApplications.length;

  let allUpdates = await Update.find({});
  let updatesForAll = allUpdates.filter((update) =>
    update.forCourse.includes("All")
  );
  let updatesForMtechCs = allUpdates.filter((update) =>
    update.forCourse.includes("MtechCs")
  );
  let updatesForMtechAdsai = allUpdates.filter((update) =>
    update.forCourse.includes("MtechAdsai")
  );
  let updatesForMscCs = allUpdates.filter((update) =>
    update.forCourse.includes("MScCs")
  );
  let updatesForMscDfis = allUpdates.filter((update) =>
    update.forCourse.includes("MscDfis")
  );
  let allplacedStudents = await Student.find({ isPlaced: true });

  let allDeboardedStudents = await Student.find({ isDeboarded: true });

  let allResolvedQueries = await Query.find({ markedAsResolved: true });
  let allUnresolvedQueries = await Query.find({ markedAsResolved: false });

  let allDisabledCompanies = await Recruiter.find({ isDeboarded: true });

  let adminsettings = await AdminSetting.findOne();
  let isStuRegisEnabled = adminsettings.furtherStudentRegisEnabled;
  let isCompRegisEnabled = adminsettings.furtherCompanyRegisEnabled;
  return res.render("users/admin.ejs", {
    allRecruitersPending: allRecruitersPending,
    allAuditedRecruiters: allAuditedRecruiters,
    allStudentsPending: allStudentsPending,
    allRegisteredRecruiters: allRegisteredRecruiters,
    allAuditedStudents: allAuditedStudents,
    allRegisteredStudents: allRegisteredStudents,
    allListedRecruiters: allListedRecruiters,
    allApplications: allApplications,
    countAllRecruitersPending: countAllRecruitersPending,
    countAllRegisteredRecruiters: countAllRegisteredRecruiters,
    countAllListedRecruiters: countAllListedRecruiters,
    countallStudentsPending: countallStudentsPending,
    countallRegisteredStudents: countallRegisteredStudents,
    countallAuditedStudents: countallAuditedStudents,
    countallApplications: countallApplications,
    updatesForAll: updatesForAll,
    updatesForMtechCs: updatesForMtechCs,
    updatesForMtechAdsai: updatesForMtechAdsai,
    updatesForMscCs: updatesForMscCs,
    updatesForMscDfis: updatesForMscDfis,
    allplacedStudents: allplacedStudents,
    allDeboardedStudents: allDeboardedStudents,
    allUnresolvedQueries: allUnresolvedQueries,
    allResolvedQueries: allResolvedQueries,
    allDisabledCompanies: allDisabledCompanies,
    currentAdminSection: req.query.currentAdminSection || "Dashboard",
    isStuRegisEnabled: isStuRegisEnabled,
    isCompRegisEnabled: isCompRegisEnabled,
  });
};

module.exports.showRecDetails = async (req, res) => {
  let { recid } = req.params;
  let { noAuditNeeded } = req.query;

  try {
    let recDetails = await Recruiter.findOne({ _id: recid });

    if (!recDetails) {
      // If recruiter not found, return a 404 Not Found response
      return res.status(404).send("Recruiter not found");
    }

    // console.log(recDetails);
    // If recruiter found, send the recruiter details to the client
    return res.render("resources/recruiterDetails", {
      recruiter: recDetails,
      recid: recid,
      noAuditNeeded: noAuditNeeded,
    });
  } catch (error) {
    // If an error occurs during database query, return a 500 Internal Server Error response
    return res.status(500).send("Error fetching recruiter details:" + error);
  }
};

module.exports.markRecAudit = async (req, res) => {
  let { recid } = req.params;
  try {
    let { currentAdminSection } = req.query;

    let recDetails = await Recruiter.findOne({ _id: recid });

    if (!recDetails) {
      // If recruiter not found, return a 404 Not Found response
      return res.status(404).send("Recruiter not found");
    }

    // Update the isAudited field to true
    recDetails.isAudited = true;
    recDetails.isRegistered = false;

    // Save the changes to the database
    await recDetails.save();

    //Send Email to the Recruiter informing him of pursuing further detailed registration

    let regisLink = `https://placementcellnfsu.onrender.com/register/rec?recid=${recid}`;
    let message = `<p style="color: red;">Dear Respected Recruiter,</p>

<br/>
We have audited and accepted your participation request associated with your account in The NFSU School of Cyber Security and Digital Forensics Placement Cell. We Request you to Please Follow the Given Link below and complete the <strong>Remaining Registration Procedure.</strong>.
<br/><br/>
 <strong>Following is The Registration Link</strong>:
<br/><br/>
<h1>
<strong>${regisLink}</strong></h1>
<br/>
You can paste the above Link in the Browser's address bar.
 <br/><br/>
 Please Complete Your Remaining Registration Procedure as soon as possible.
 <br/><br/>
<strong>Thank you,</strong><br/>
<p style="color: red;">The Placement Team .</p>
<br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1710502741/emblem_e7gmxn.png"
      style="border-radius:2rem;width:60%;"
      alt="..."
    />
</div>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreply.spcweb@gmail.com",
        pass: process.env.APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: "noreply@placementcell <noreply.spcweb@gmail.com>",

      to: recDetails.headhremail,
      subject: "Registration Pending Information",
      html: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Failed to send Registration Mail");
      } else {
        req.flash("success", "Recruiter Updated Successfully !");
        return res.redirect(
          `/admin?currentAdminSection=${currentAdminSection}`
        );
      }
    });

    // Respond with a success message
  } catch (error) {
    // If an error occurs during database query or save operation,
    // return a 500 Internal Server Error response
    console.error("Error updating recruiter details:", error);
    return res.status(500).send("Error updating recruiter details");
  }
};

module.exports.arrayMarkRecAudit = async (req, res) => {
  try {
    let { currentAdminSection } = req.query;

    let { selectedRows } = req.body;
    console.log(selectedRows);
    if (
      !selectedRows ||
      !Array.isArray(selectedRows) ||
      selectedRows.length === 0
    ) {
      return res
        .status(400)
        .send("Invalid request format or no recruiters selected");
    }

    for (let i = 0; i < selectedRows.length; i++) {
      let { recid } = selectedRows[i];
      let recDetails = await Recruiter.findOne({ _id: recid });

      if (!recDetails) {
        // If recruiter not found, return a 404 Not Found response
        return res.status(404).send("Recruiter not found");
      }

      // Update the isAudited field to true
      recDetails.isAudited = true;
      recDetails.isRegistered = false;

      // Save the changes to the database
      await recDetails.save();

      //Send Email to the Recruiter informing him of pursuing further detailed registration

      let regisLink = `https://placementcellnfsu.onrender.com/register/rec?recid=${recid}`;
      let message = `<p style="color: red;">Dear Respected Recruiter,</p>

<br/>
We have audited and accepted your participation request associated with your account in The NFSU School of Cyber Security and Digital Forensics Placement Cell. We Request you to Please Follow the Given Link below and complete the <strong>Remaining Registration Procedure</strong>.
<br/><br/>

<br/><br/>
 <strong>Following is The Registration Link</strong>:
<br/><br/>
<h1>
<strong>${regisLink}</strong></h1>
<br/>
You can paste the above Link in the Browser's address bar.
 <br/><br/>
 Please Complete Your Remaining Registration Procedure as soon as possible.
 <br/><br/>
<strong>Thank you,</strong><br/>
<p style="color: red;">The Placement Team .</p>
<br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1710502741/emblem_e7gmxn.png"
      style="border-radius:2rem;width:60%;"
      alt="..."
    />
</div>`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "noreply.spcweb@gmail.com",
          pass: process.env.APP_PASSWORD,
        },
      });
      const mailOptions = {
        from: "noreply@placementcell <noreply.spcweb@gmail.com>",

        to: recDetails.headhremail,
        subject: "Registration Pending Information",
        html: message,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Failed to send Registration Mail");
        } else {
          req.flash("success", "Recruiter Updated Successfully !");
          return res.redirect(
            `/admin?currentAdminSection=${currentAdminSection}`
          );
        }
      });

      // Respond with a success message
    }
  } catch (error) {
    // If an error occurs during database query or save operation,
    // return a 500 Internal Server Error response
    console.error("Error updating recruiter details:", error);
    return res.status(500).send("Error updating recruiter details");
  }
};

module.exports.addCompanyListing = async (req, res) => {
  let jobdesccount = 1;
  const uploadedFilesjobdesc = req.files.reduce((acc, file) => {
    acc[`jobDescriptionFile${jobdesccount}`] = file.path; // Cloudinary URL
    jobdesccount++; // Increment the counter
    return acc;
  }, {});

  const jobtitles = Object.keys(req.body)
    .filter((key) => key.startsWith("jobTitle"))
    .reduce((acc, key) => {
      acc[key] = req.body[key];
      return acc;
    }, {});

  let { currentAdminSection } = req.query;
  let dateObject = new Date(req.body.lastDateToApply);
  dateObject.setHours(23, 59, 0, 0);
  let newListing = new Listing({
    isDreamOffer: req.body.isDreamOffer,
    jobDescriptionFiles: uploadedFilesjobdesc,
    companyName: req.body.companyName,
    jobLocation: req.body.jobLocation,
    jobType: req.body.jobType,
    jobTitles: jobtitles,
    forCourse: req.body.forCourse,
    ctc: req.body.ctc,
    lastDateToApply: dateObject,
  });

  await newListing.save();
  req.flash("success", "Listing Added Successfully !");
  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.showListingDetails = async (req, res) => {
  let { listingId } = req.params;
  let listingDetails = await Listing.findOne({ _id: listingId });

  return res.render("resources/listingDetails.ejs", {
    listingDetails: listingDetails,
  });
};

module.exports.updateListing = async (req, res) => {
  let { listingId } = req.params;
  let query = { _id: listingId };

  // Initialize an object to hold the transformed job titles
  const jobTitles = {};

  // Transform req.body to nest job titles under jobTitles key
  Object.keys(req.body).forEach((key) => {
    if (key.startsWith("jobTitle")) {
      jobTitles[key] = req.body[key];
      delete req.body[key]; // Remove the flat key from req.body
    }
  });

  // Add the nested jobTitles object to req.body
  req.body.jobTitles = jobTitles;

  let listing = await Listing.findOne(query);

  req.body.jobDescriptionFiles = listing.jobDescriptionFiles;

  let jobdesccount = 1;
  const uploadedFilesjobdesc = req.files.reduce((acc, file) => {
    acc[`jobDescriptionFile${jobdesccount}`] = file.path; // Cloudinary URL
    jobdesccount++; // Increment the counter
    return acc;
  }, {});

  const updatedJobDescriptionFiles = {};

  Object.keys(req.body.jobDescriptionFiles || {}).forEach((key) => {
    if (uploadedFilesjobdesc.hasOwnProperty(key)) {
      updatedJobDescriptionFiles[key] = uploadedFilesjobdesc[key];
    } else {
      updatedJobDescriptionFiles[key] = req.body.jobDescriptionFiles[key];
    }
  });

  // Assign the updated jobDescriptionFiles to req.body
  req.body.jobDescriptionFiles = updatedJobDescriptionFiles;
  const update = {
    $set: {
      ...req.body,
      isDreamOffer: req.body.isDreamOffer === "on" ? true : false,
    },
  };

  let options = { new: true };

  let result = await Listing.findOneAndUpdate(query, update, options);

  if (!result) {
    req.flash("error", "Listing Updation Failed !");
    return res.redirect(`/admin/listingDetails/${listingId}`);
  }
  req.flash("success", "Listing Updated Successfully !");

  return res.redirect(
    `/admin/listingDetails/${listingId}?currentAdminSection=Updates`
  );
};

module.exports.removeCompanyListing = async (req, res) => {
  let { listingId } = req.params;
  let listing = await Listing.findOne({ _id: listingId });
  if (req.query.hasOwnProperty("delete")) {
    await Listing.deleteMany({ _id: listingId });
    await Application.deleteMany({ listingId: listingId });

    req.flash("success", "Listing Deleted Successfully !");
    return res.redirect("/admin?currentAdminSection=Companies");
  }
  listing.isDown = true;
  await listing.save();
  req.flash("success", "Listing Down Successfully !");
  req.session.save();
  setTimeout(() => {}, 1000);
  return res.redirect("/admin?currentAdminSection=Companies");
};

module.exports.markStuAudit = async (req, res) => {
  let { verifiedStuID } = req.params;
  let stuVerified = await VerifiedUser.findOne({ _id: verifiedStuID });
  await VerifiedUser.deleteMany({ _id: verifiedStuID });
  let twoDigitNo = stuVerified.bodyData.enrollnostu.slice(-2);
  let courseName = stuVerified.bodyData.coursename;
  function generatePID(courseName, twoDigitNo) {
    let prefix = "";
    switch (courseName) {
      case "MSc Cs":
        prefix = "PL-MSCS-";
        break;
      case "MSc Dfis":
        prefix = "PL-MSDF-";
        break;
      case "MTech Cs":
        prefix = "PL-MTCS-";
        break;
      case "MTech Adsai":
        prefix = "PL-MTADSAI-";
        break;
      default:
        return "Invalid course name";
    }
    return prefix + twoDigitNo;
  }

  let pId = generatePID(courseName, twoDigitNo);
  let password = uuidv4();

  const newStudent = new Student({
    isAudited: true,
    isRegistered: false,
    haveResetPass: false,
    enrollmentNo: stuVerified.bodyData.enrollnostu,
    fullname: stuVerified.bodyData.stuname,
    tenthMarksheetUrl: "",
    twelthMarksheetUrl: "",
    profilePictureUrl: "",
    fathername: "",
    mothername: "",
    course: stuVerified.bodyData.coursename,
    gender: "",
    birthdate: "",
    maritalstatus: "",
    disability: "",
    mobileno: stuVerified.bodyData.stumobno,
    altmobileno: "",
    email: stuVerified.bodyData.email,
    altemail: "",
    category: "",
    nationality: "",
    presentcountry: "",
    presentstate: "",
    presentdistrict: "",
    username: pId,
    landmark: "",
    presentaddress: "",
    pincode: "",
    tenth: "",
    twelth: "",
    lastsemcgpa: "",
  });

  //send credentials
  let message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
        /* Reset styles */
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f5f5f5;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #007bff;
            margin-bottom: 20px;
        }

        .credentials {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .credentials p {
            margin-bottom: 5px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }

        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to SPC SCSDF!</h1>
        <p>We're excited to have you onboard. Below are your login credentials:</p>
        <div class="credentials">
            <p><strong>Username:
            <br> </strong>${pId}</p>
            <p><strong>Password:
            <br> </strong>${password}</p>
        </div>
        <p>Please use the provided credentials to log in to your account and complete your registration process as soon as possible.</p>
        <p>If you have any questions or need assistance, feel free to contact us.</p>
    </div>
</body>
</html>
`;

  const registeredStudent = await Student.register(newStudent, password);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreply.spcweb@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "noreply@placementcell <noreply.spcweb@gmail.com>",

    to: stuVerified.bodyData.email,
    subject:
      "Welcome to National Forensic Science University's Placement Cell.",
    html: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.flash("error", "error in sending credentials to student : " + error);
      return res.redirect("/admin");
    } else {
      req.flash("success", "Student marked as Verified. ");
      return res.redirect("/admin?currentAdminSection=Students");
    }
  });
};

module.exports.markStuArrayAudit = async (req, res) => {
  // let { idsOfCheckboxes } = req.body;
  // const idsOfCheckboxesArray = JSON.parse(idsOfCheckboxes);

  // for (verifiedStuID of idsOfCheckboxesArray) {
  const { selectedRows } = req.body;

  for (const row of selectedRows) {
    const verifiedStuID = row.stuid;

    try {
      let stuVerified = await VerifiedUser.findOne({ _id: verifiedStuID });
      await VerifiedUser.deleteMany({ _id: verifiedStuID });
      let twoDigitNo = stuVerified.bodyData.enrollnostu.slice(-2);
      let courseName = stuVerified.bodyData.coursename;
      function generatePID(courseName, twoDigitNo) {
        let prefix = "";
        switch (courseName) {
          case "MSc Cs":
            prefix = "PL-MSCS-";
            break;
          case "MSc Dfis":
            prefix = "PL-MSDF-";
            break;
          case "MTech Cs":
            prefix = "PL-MTCS-";
            break;
          case "MTech Adsai":
            prefix = "PL-MTADSAI-";
            break;
          default:
            return "Invalid course name";
        }
        return prefix + twoDigitNo;
      }

      let pId = generatePID(courseName, twoDigitNo);
      let password = uuidv4();

      const newStudent = new Student({
        isAudited: true,
        isRegistered: false,
        haveResetPass: false,
        enrollmentNo: stuVerified.bodyData.enrollnostu,
        fullname: stuVerified.bodyData.stuname,
        tenthMarksheetUrl: "",
        twelthMarksheetUrl: "",
        profilePictureUrl: "",
        fathername: "",
        mothername: "",
        course: stuVerified.bodyData.coursename,
        gender: "",
        birthdate: "",
        maritalstatus: "",
        disability: "",
        mobileno: stuVerified.bodyData.stumobno,
        altmobileno: "",
        email: stuVerified.bodyData.email,
        altemail: "",
        category: "",
        nationality: "",
        presentcountry: "",
        presentstate: "",
        presentdistrict: "",
        username: pId,
        landmark: "",
        presentaddress: "",
        pincode: "",
        tenth: "",
        twelth: "",
        lastsemcgpa: "",
      });

      //send credentials
      let message = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Platform</title>
      <style>
          /* Reset styles */
          body, p, h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
          }

          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              background-color: #f5f5f5;
              color: #333;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          h1 {
              color: #007bff;
              margin-bottom: 20px;
          }

          .credentials {
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
          }

          .credentials p {
              margin-bottom: 5px;
          }

          .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
          }

          .btn:hover {
              background-color: #0056b3;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Welcome to The Placement Season 2023-24 !</h1>
          <p>We're excited to have you onboard. Below are your login credentials:</p>
          <div class="credentials">
              <p><strong>Username:
              <br> </strong>${pId}</p>
              <p><strong>Password:
              <br> </strong>${password}</p>
          </div>
          <p>Please use the provided credentials to log in to your account and complete your registration process as soon as possible.</p>
          <p>If you have any questions or need assistance, feel free to contact us.</p>
          <a href="#" style="color:white;" class="btn">Login Now</a>
      </div>
  </body>
  </html>
  `;

      const registeredStudent = await Student.register(newStudent, password);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "noreply.spcweb@gmail.com",
          pass: process.env.APP_PASSWORD,
        },
      });
      const mailOptions = {
        from: "noreply@placementcell <noreply.spcweb@gmail.com>",

        to: stuVerified.bodyData.email,
        subject:
          "Welcome to National Forensic Science University's Placement Cell.",
        html: message,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.flash(
            "error",
            "error in sending credentials to student : " + error
          );
          // return res.redirect("/admin");
          console.log("error in sending mail to array of students ", error);
        } else {
          // req.flash("success", "Student marked as Audited. ");
          // return res.redirect("/admin");
        }
      });
    } catch (e) {
      console.log("error in registering array of students ", e);
    }
  }
  req.flash("success", "All Marked Students Verified !");
  return res.redirect("/admin?currentAdminSection=Students");
};

module.exports.deboardRecruiter = async (req, res) => {
  let { recid } = req.params;
  let { currentAdminSection } = req.query;

  let result = await Recruiter.findOne({ _id: recid });
  result.isDeboarded = true;
  await Application.deleteMany({ listingId: recid });
  await result.save();
  req.flash("success", "Recruiter Desabled Successfully !");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.deboardStudent = async (req, res) => {
  let { stuid } = req.params;
  let stu = await Student.findOne({ _id: stuid });

  if (stu) {
    await VerifiedUser.deleteMany({
      "bodyData.email": stu.email,
    });
  } else {
    await VerifiedUser.deleteMany({
      _id: stuid,
    });
  }

  await Application.deleteMany({ stuId: stuid });
  // await Student.deleteMany({ _id: stuid });
  stu.isDeboarded = true;
  stu.isRegistered = false;

  await stu.save();

  req.flash("success", "Student Account Disabled Successfully !");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect("/admin?currentAdminSection=Students");
};

module.exports.onboardStudent = async (req, res) => {
  let { stuid } = req.params;
  let stu = await Student.findOne({ _id: stuid });

  stu.isDeboarded = false;

  await stu.save();

  req.flash("success", "Student Enabled Successfully !");
  return res.redirect("/admin?currentAdminSection=Students");
};

module.exports.onboardRecruiter = async (req, res) => {
  let { currentAdminSection } = req.query;

  let { recid } = req.params;
  let result = await Recruiter.findOne({ _id: recid });
  result.isDeboarded = false;
  await result.save();
  req.flash("success", "Recruiter Enabled Successfully !");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.exportAllStudentData = async (req, res) => {
  try {
    const students = await Student.find({});

    sanitizedStudents = students.map((student) => ({
      Username: student.username || "null",
      "Account Disabled": student.isDeboarded || "null",
      "Course ": student.course || "null",
      "Full Name": student.fullname || "null",
      "Father Name": student.fathername || "null",
      "Mother Name": student.mothername || "null",
      Birthdate: student.birthdate || "null",
      "Mobile Number": student.mobileno || "null",
      "Alternate Mobile Number": student.altmobileno || "null",
      Email: student.email || "null",
      "Alternate Email": student.altemail || "null",
      "Is Verified": student.isAudited || "null",
      "Is Registered": student.isRegistered || "null",
      Category: student.category || "null",
      Nationality: student.nationality || "null",
      "Present Country": student.presentcountry || "null",
      "Present State": student.presentstate || "null",
      "Present District": student.presentdistrict || "null",
      "Present Landmark": student.landmark || "null",
      "Present Address": student.presentaddress || "null",
      Gender: student.gender || "null",
      "Enrollment Number": student.enrollmentNo || "null",
      Pincode: student.pincode || "null",
      "Placed Status": student.isPlaced || "null",
      "Placed Date": student.placedDate || "null",
      "Placed Job Type": student.placedJobType || "null",
      "Placed Job Company": student.placedCompany || "null",
      "Placed Job CTC": student.placedCtc || "null",
      "Placed Job Location": student.placedJobLocation || "null",
      "Placed Job Description": student.placedJobDescription || "null",
      "Placed Other Details": student.placedOtherDetails || "null",
      "Reseted Password Status": student.haveResetPass || "null",
      "Tenth Marksheet URL": student.tenthMarksheetUrl || "null",
      "Twelth Marksheet URL": student.twelthMarksheetUrl || "null",
      "Tenth Marks": student.tenth || "null",
      "Twelth Marks": student.twelth || "null",
      "Last Semester CGPA": student.lastsemcgpa || "null",
      "Other Marksheet URL": student.othermarksheetUrl || "null",
      "Other Marks": student.othermarks || "null",
      "Other Year of Passing": student.otheryearofpassing || "null",
      "Other Year of Joining": student.otheryrofjoining || "null",
      "Other Institute Name": student.otherintitutename || "null",
      "Other University": student.otheruniversity || "null",
      "Post-Graduation Marksheet URL":
        student.postgraduationmarksheetUrl || "null",
      "Post-Graduation Marks": student.postgraduation || "null",
      "Post-Graduation Year of Passing":
        student.postgraduationyearofpassing || "null",
      "Post-Graduation Year of Joining":
        student.postgraduationyrofjoining || "null",
      "Post-Graduation Institure Name":
        student.postgraduationintitutename || "null",
      "Post-Graduation University": student.postgraduationuniversity || "null",
      "Graduation Marksheet URL": student.graduationmarksheetUrl || "null",
      "Graduation Marks": student.graduation || "null",
      "Graduation Year of Passing": student.graduationyearofpassing || "null",
      "Graduation Year of Joining": student.graduationyrofjoining || "null",
      "Graduation Institute Name": student.graduationintitutename || "null",
      "Graduation University": student.graduationuniversity || "null",
      "Twelth Year of Passing": student.twelthyearofpassing || "null",
      "Twelth Year of Joining": student.twelthyrofjoining || "null",
      "Twelth Institure Name": student.twelthintitutename || "null",
      "Twelth Board Name": student.twelthBoard || "null",
      "Tenth Institute Name": student.tenthintitutename || "null",
      "Tenth Year of Joining": student.tenthyearofjoining || "null",
      "Tenth Year of Passing": student.tenthyearofpassing || "null",
      "Tenth Board Name": student.tenthboard || "null",
      "Profile Picture URL": student.profilePictureUrl || "null",
    }));

    sanitizedStudents = sanitizedStudents.filter(
      (studentObj) => studentObj.Username != process.env.ADMIN_USERNAME
    );

    //Order of Keywords in the csv is determined by the order of fields in written above

    const csv = await converter.json2csv(sanitizedStudents);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, "0");
    var min = String(today.getMinutes()).padStart(2, "0");
    var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + "_" + min;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SPC Students ${formattedDateTime}.csv`
    );
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    return res.status(500).send("Error exporting CSV");
  }
};

module.exports.exportAllCompanyData = async (req, res) => {
  try {
    const companies = await Recruiter.find({});
    sanitizedcompanies = companies.map((company) => ({
      "Company Name": company.companyname,
      "Company Disabled": company.isDeboarded,
      "Is Verified ": company.isAudited || "null",
      "Is Registered": company.isRegistered || "null",
      "Nature of Business": company.natureofbusiness || "null",
      "Website Link": company.websitelink || "null",
      "Postal Address": company.postaladdress || "null",
      Category: company.category || "null",
      "Head Hr Name": company.headhrname || "null",
      "Head Hr Designation": company.headhrdesignation || "null",
      // "Alternate Email": company.altemail || "null",
      // "Is Verified": company.isAudited || "null",
      // "Is Registered": company.isRegistered || "null",
      // Category: company.category || "null",
      // Nationality: company.nationality || "null",
      // "Present Country": company.presentcountry || "null",
      // "Present State": company.presentstate || "null",
      // "Present District": company.presentdistrict || "null",
      // "Present Landmark": company.landmark || "null",
      // "Present Address": company.presentaddress || "null",
      // Gender: company.gender || "null",
      // "Enrollment Number": company.enrollmentNo || "null",
      // Pincode: company.pincode || "null",
      // "Placed Status": company.isPlaced || "null",
      // "Placed Date": company.placedDate || "null",
      // "Placed Job Type": company.placedJobType || "null",
      // "Placed Job Company": company.placedCompany || "null",
      // "Placed Job CTC": company.placedCtc || "null",
      // "Placed Job Location": company.placedJobLocation || "null",
      // "Placed Job Description": company.placedJobDescription || "null",
      // "Placed Other Details": company.placedOtherDetails || "null",
      // "Reseted Password Status": company.haveResetPass || "null",
      // "Tenth Marksheet URL": company.tenthMarksheetUrl || "null",
      // "Twelth Marksheet URL": company.twelthMarksheetUrl || "null",
      // "Tenth Marks": company.tenth || "null",
      // "Twelth Marks": company.twelth || "null",
      // "Last Semester CGPA": company.lastsemcgpa || "null",
      // "Other Marksheet URL": company.othermarksheetUrl || "null",
      // "Other Marks": company.othermarks || "null",
      // "Other Year of Passing": company.otheryearofpassing || "null",
      // "Other Year of Joining": company.otheryrofjoining || "null",
      // "Other Institute Name": company.otherintitutename || "null",
      // "Other University": company.otheruniversity || "null",
      // "Post-Graduation Marksheet URL":
      //   company.postgraduationmarksheetUrl || "null",
      // "Post-Graduation Marks": company.postgraduation || "null",
      // "Post-Graduation Year of Passing":
      //   company.postgraduationyearofpassing || "null",
      // "Post-Graduation Year of Joining":
      //   company.postgraduationyrofjoining || "null",
      // "Post-Graduation Institure Name":
      //   company.postgraduationintitutename || "null",
      // "Post-Graduation University": company.postgraduationuniversity || "null",
      // "Graduation Marksheet URL": company.graduationmarksheetUrl || "null",
      // "Graduation Marks": company.graduation || "null",
      // "Graduation Year of Passing": company.graduationyearofpassing || "null",
      // "Graduation Year of Joining": company.graduationyrofjoining || "null",
      // "Graduation Institute Name": company.graduationintitutename || "null",
      // "Graduation University": company.graduationuniversity || "null",
      // "Twelth Year of Passing": company.twelthyearofpassing || "null",
      // "Twelth Year of Joining": company.twelthyrofjoining || "null",
      // "Twelth Institure Name": company.twelthintitutename || "null",
      // "Twelth Board Name": company.twelthBoard || "null",
      // "Tenth Institute Name": company.tenthintitutename || "null",
      // "Tenth Year of Joining": company.tenthyearofjoining || "null",
      // "Tenth Year of Passing": company.tenthyearofpassing || "null",
      // "Tenth Board Name": company.tenthboard || "null",
    }));

    const csv = await converter.json2csv(sanitizedcompanies);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, "0");
    var min = String(today.getMinutes()).padStart(2, "0");
    var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + "_" + min;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SPC Companies ${formattedDateTime}.csv`
    );
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    return res.status(500).send("Error exporting CSV");
  }
};

module.exports.pushUpdateToStudents = async (req, res) => {
  let { currentAdminSection } = req.query;

  let newUpdate = new Update(req.body);
  await newUpdate.save();
  req.flash("Update sent Successfully !");
  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.deleteUpdate = async (req, res) => {
  let { currentAdminSection } = req.query;

  let { updateId } = req.params;
  await Update.deleteMany({ _id: updateId });
  req.flash("success", "Update Deleted Successfully !");
  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.renderPlacedStudentForm = (req, res) => {
  let { currentAdminSection } = req.query;
  return res.render("resources/placedstudent.ejs", {
    applicationId: req.params.applicationId,
    currentAdminSection: currentAdminSection,
  });
};

module.exports.markPlacedStudent = async (req, res) => {
  let { currentAdminSection } = req.query;
  let application = await Application.findOne({
    _id: req.params.applicationId,
  });
  let student = await Student.findOne({ _id: application.stuId });
  student.isPlaced = true;
  student.placedCompany = req.body.companyname;
  student.placedCtc = req.body.ctc;
  student.placedJobLocation = req.body.joblocation;
  student.placedJobDescription = req.body.jobdescription;
  student.placedOtherDetails = req.body.otherdetails;
  student.placedJobType = req.body.jobtype;
  student.placedDate = Date.now();

  await student.save();

  let notDreamListings = await Listing.find({ isDreamOffer: false });
  notDreamListings.forEach(async (listing) => {
    await Application.deleteMany({
      stuId: student._id,
      listingId: listing._id,
    });
  });

  req.flash("success", "Marked as Placed Successfully !");
  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.markQueryResolved = async (req, res) => {
  let { currentAdminSection } = req.query;
  let { reply } = req.body;
  if (!reply) reply = "Marked as Resolved";

  let query = await Query.findOne({ _id: req.params.queryId });

  query.reply = reply;
  query.markedAsResolved = true;
  await query.save();

  req.flash("success", "Query Marked as Resolved");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.arrayMarkQueryResolved = async (req, res) => {
  let { currentAdminSection } = req.query;

  const selectedRows = req.body.selectedRows;

  // Assuming Query is a Mongoose model
  for (const selectedRow of selectedRows) {
    const { queryId, response } = selectedRow;

    let reply = response;
    if (!reply) reply = "Marked as Resolved";

    // Find the query by ID
    let query = await Query.findOne({ _id: queryId });

    // Update query properties
    query.reply = reply;
    query.markedAsResolved = true;

    // Save the updated query
    await query.save();
  }

  req.flash("success", "Queries Marked as Resolved");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.updateApplicationStatus = async (req, res) => {
  let { currentAdminSection } = req.query;

  let { applicationStatus } = req.body;
  if (!applicationStatus) applicationStatus = "In Progress";

  let application = await Application.findOne({
    _id: req.params.applicationId,
  });

  application.applicationStatus = applicationStatus;
  await application.save();

  req.flash("success", "Application Status Updated !");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.arrayUpdateApplicationStatus = async (req, res) => {
  const selectedRows = req.body.selectedRows;
  let { currentAdminSection } = req.query;

  // Assuming Query is a Mongoose model
  for (const selectedRow of selectedRows) {
    const { applicationId, updatedStatus } = selectedRow;

    if (!updatedStatus) updatedStatus = "In Progress";

    // Find the query by ID
    let application = await Application.findOne({ _id: applicationId });

    // Update query properties
    application.applicationStatus = updatedStatus;

    // Save the updated query
    await application.save();
  }

  req.flash("success", "Applications Updated !");
  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect(`/admin?currentAdminSection=${currentAdminSection}`);
};

module.exports.toggleRegisProcess = async (req, res) => {
  //There has to be only one object in the AdminSetting model which contains all the admin settings
  let adminsettings = await AdminSetting.findOne();

  if (req.url.includes("Student")) {
    if (adminsettings.furtherStudentRegisEnabled) {
      adminsettings.furtherStudentRegisEnabled = false;
      req.flash("success", "Further Student's Registration Disabled !");
    } else {
      adminsettings.furtherStudentRegisEnabled = true;
      req.flash("success", "Further Student's Registration Enabled !");
    }
  } else {
    if (adminsettings.furtherCompanyRegisEnabled) {
      adminsettings.furtherCompanyRegisEnabled = false;
      req.flash("success", "Further Companies Registration Disabled !");
    } else {
      adminsettings.furtherCompanyRegisEnabled = true;
      req.flash("success", "Further Companies Registration Enabled !");
    }
  }

  await adminsettings.save();

  req.session.save();
  setTimeout(() => {}, 1000);

  return res.redirect("/admin?currentAdminSection=Dashboard");
};

module.exports.showAdminReportEjs = (req, res) => {
  //Send dynamic data from here to the ejs

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var hh = String(today.getHours()).padStart(2, "0");
  var min = String(today.getMinutes()).padStart(2, "0");
  var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + ":" + min;
  return res.render("resources/reportplacementcelladmin.ejs", {
    formattedDateTime: formattedDateTime,
  });
};
module.exports.renderAdminReportPdf = async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `${req.protocol}://${req.get("host")}` + "/admin/showAdminReport",
    {
      waitUntil: "networkidle2",
    }
  );

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var hh = String(today.getHours()).padStart(2, "0");
  var min = String(today.getMinutes()).padStart(2, "0");
  var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + "_" + min;
  await page.setViewport({ width: 1920, height: 1080 });

  // let pdfn = await page.pdf({
  //   path: `${path.join(
  //     __dirname,
  //     "../public/files",
  //     "SCSDF Placement Cell Report " + formattedDateTime + ".pdf"
  //   )}`,
  //   printBackground: true,
  //   format: "A4",
  // });

  let pdfBuffer = await page.pdf({
    printBackground: true,
    format: "A4",
  });

  await browser.close();

  // const pdfUrl = path.join(
  //   __dirname,
  //   "../public/files",
  //   "SCSDF Placement Cell Report " + formattedDateTime + ".pdf"
  // );

  // return res.download(pdfUrl, function (err) {
  //   if (err) {
  //     return res.send(err.message);
  //   }
  // });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Length": pdfBuffer.length,
    "Content-Disposition": `inline; filename="Placement Cell Report ${formattedDateTime}.pdf"`,
  });
  return res.send(pdfBuffer);
};
