const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const { MongoMemoryServer } = require("mongodb-memory-server");
const Student = require("../models/student");
const Listing = require("../models/listing");
const Update = require("../models/update");
const {
  renderApplyForm,
  showAccount,
  showStuPlacementProfile,
} = require("../controllers/account");
const Application = require("../models/application");
const path = require("path");

// Set up an Express app for testing
const app = express();
app.use(express.static(path.join(__dirname, "/public")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); // Set EJS as the view engine

const tempId = new mongoose.Types.ObjectId();
app.use((req, res, next) => {
  req.flash = jest.fn();
  req.user = {
    isRegistered: true,
    course: "MTech Cs",
    isPlaced: false,
    _id: tempId,
    placedJobType: "null",
    profilePictureUrl: "/path/to/profile.jpg",
    isDeboarded: false,
  };
  res.locals.isAdmin = false;
  res.locals.isAuthenticated = true;
  res.locals.success = "true";
  res.locals.error = "true";
  next();
});

app.get("/renderApplyForm", renderApplyForm);
app.get("/showAccount", showAccount);
app.get("/showStuPlacementProfile", showStuPlacementProfile);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await Student.deleteMany({});
  await Listing.deleteMany({});
  await Application.deleteMany({});
  await Update.deleteMany({});
});

describe("GET /showAccount", () => {
  test("should render account page ", async () => {
    const response = await request(app)
      .get("/showAccount")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Dashboard");
    expect(response.text).toContain("Admin Updates");
  });

  test("should redirect to /account on error", async () => {
    jest.spyOn(Application, "find").mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const response = await request(app)
      .get("/showAccount")
      .set("Accept", "application/json");

    expect(response.status).toBe(302); // Redirect status
    expect(response.headers.location).toBe("/account");
  });
});

describe("GET /renderApplyForm", () => {
  it("should render Application form if right queries are sent", async () => {
    const studentData = await Student.create({
      _id: new mongoose.Types.ObjectId(),
      isRegistered: true,
      isDeboarded: false,
      profilePictureUrl: "xyz",
      fullname: "John Doe",
      email: "john.doe@example.com",
    });

    const listingData = await Listing.create({
      _id: new mongoose.Types.ObjectId(),
      lastDateToApply: Date.now(),
      ctc: 112,
      jobTitles: { jobTitle1: "sde1" },
      jobType: "cybersec",
      jobLocation: "gnr",
      companyName: "bata",
      jobDescriptionFiles: { jobDescriptionFile1: "xyz" },
    });

    const response = await request(app)
      .get("/renderApplyForm")
      .query({
        stuId: studentData._id.toString(),
        listingId: listingData._id.toString(),
      })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toContain(listingData.companyName);
  });

  it("should show student or listing not found err if Wrong queries are sent", async () => {
    const studentData = await Student.create({
      _id: new mongoose.Types.ObjectId(),
      isRegistered: true,
      isDeboarded: false,
      profilePictureUrl: "xyz",
      fullname: "John Doe",
      email: "john.doe@example.com",
    });
    const listingData = await Listing.create({
      _id: new mongoose.Types.ObjectId(),
      lastDateToApply: Date.now(),
      ctc: 112,
      jobTitles: { jobTitle1: "sde1" },
      jobType: "cybersec",
      jobLocation: "gnr",
      companyName: "bata",
      jobDescriptionFiles: { jobDescriptionFile1: "xyz" },
    });

    const tempId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get("/renderApplyForm")
      .query({
        stuId: tempId.toString(),
        listingId: tempId.toString(),
      })
      .set("Accept", "application/json");

    expect(response.status).toBe(302); // Redirect status
    expect(response.headers.location).toBe("/account");
  });

  it("should redirect to /account with an error message if the student is deboarded", async () => {
    const student = await Student.create({
      _id: new mongoose.Types.ObjectId(),
      isDeboarded: true,
    });

    const listing = await Listing.create({
      _id: new mongoose.Types.ObjectId(),
      //schema requires these things to be mentioned also
      lastDateToApply: Date.now(),
      ctc: 112,
      jobTitles: { jobTitle1: "sde1" },
      jobType: "cybersec",
      jobLocation: "gnr",
      companyName: "bata",
      jobDescriptionFiles: { jobDescriptionFile1: "xyz" },
    });

    const response = await request(app)
      .get("/renderApplyForm")
      .query({
        stuId: student._id.toString(),
        listingId: listing._id.toString(),
      })
      .set("Accept", "application/json");

    expect(response.status).toBe(302); // Redirect status
    expect(response.headers.location).toBe("/account");
  });
});

describe("GET /showStuPlacementProfile", () => {
  it("should show stu plac profile", async () => {
    let stuDetails = await Student.create({
      _id: tempId,
      profilePictureUrl: "",
      isDeboarded: false,
      placedJobType: "",
      placedCompany: "",
      placedCtc: -1,
      placedJobLocation: "",
      placedJobDescription: "",
      placedOtherDetails: "",
      isPlaced: false,
      haveResetPass: false,
      tenthMarksheetUrl: "",
      twelthMarksheetUrl: "",
      isAudited: true,
      isRegistered: true,
      course: "MTech Adsai",
      fullname: "yakuto",
      fathername: "Jetha Lal Gada",
      mothername: "Daya Gada ",
      birthdate: Date.now(),
      mobileno: 9252180504,
      altmobileno: 9252180504,
      email: "aaddiillllllllll@gmail.com",
      altemail: "smile.itsadil@gmail.com",
      category: "GENERAL",
      nationality: "India",
      presentcountry: "India",
      presentstate: "Gujarat",
      presentdistrict: "Gandhinagar",
      landmark: "Kudasan",
      presentaddress: "Near Swarnim Park, 101, Sector 10, Gandhinagar ",
      gender: "female",
      enrollmentNo: 2342352235,
      pincode: 110011,
      tenth: 99,
      twelth: 99,
      lastsemcgpa: null,
      othermarksheetUrl: "",
      othermarks: 99,
      otheryearofpassing: null,
      otheryrofjoining: null,
      otherintitutename: "",
      otheruniversity: "a",
      postgraduationmarksheetUrl: "",
      postgraduation: 99,
      postgraduationyearofpassing: null,
      postgraduationyrofjoining: null,
      postgraduationintitutename: "",
      postgraduationuniversity: "a",
      graduationmarksheetUrl: "",
      graduation: 99,
      graduationyearofpassing: null,
      graduationyrofjoining: null,
      graduationintitutename: "",
      graduationuniversity: "a",
      twelthyearofpassing: null,
      twelthyrofjoining: null,
      twelthintitutename: "",
      twelthBoard: "a",
      tenthintitutename: "3",
      tenthyearofjoining: null,
      tenthyearofpassing: 3,
      tenthboard: "",
      username: "PL-MTADSAI-35",
      placedDate: Date.now(),
      __v: 0,
    });
    const response = await request(app)
      .get("/showStuPlacementProfile")
      .query({ stuId: tempId.toString() });
    //temp id over here and in showAccounts page should match.
    expect(response.status).toBe(200);
    expect(response.text).toContain("Registration Details : Student");
  });
});
