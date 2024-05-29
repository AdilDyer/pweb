const {
  showStuPlacementProfile,
  showAccount,
  renderApplyForm,
  submitApply,
  renderQueryForm,
  submitStudentQuery,
} = require("../controllers/account");
const Student = require("../models/student");
const Application = require("../models/application");
const Listing = require("../models/listing");
const Update = require("../models/update");
const Query = require("../models/query");
const e = require("method-override");

jest.mock("../models/student");
jest.mock("../models/listing");
jest.mock("../models/application");
jest.mock("../models/update");
jest.mock("../models/query");

describe("showAccount", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        isRegistered: true,
        _id: "studentId",
        course: "CS",
        isPlaced: false,
        profilePictureUrl: "http://example.com/pic.jpg",
        placedJobType: "",
        isDeboarded: false,
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    Listing.find.mockResolvedValue([]);
    Application.find.mockResolvedValue([]);
    Update.find.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the account page with the correct data when there are no listings or applications", async () => {
    await showAccount(req, res);

    expect(Listing.find).toHaveBeenCalledWith({ isDown: false });
    expect(Application.find).toHaveBeenCalledWith({ stuId: "studentId" });
    expect(Update.find).toHaveBeenCalled();

    expect(res.render).toHaveBeenCalledWith(
      "users/youraccountstu.ejs",
      expect.objectContaining({
        isRegistered: true,
        stuId: "studentId",
        profilePictureUrl: "http://example.com/pic.jpg",
        availableListings: [],
        appliedListings: [],
        updatesToShow: [],
        isPlaced: false,
        isDeboarded: false,
        countAppliedListings: 0,
        countAvailableListings: 0,
        studentApplications: [],
        stuDetails: req.user,
      })
    );
  });
});

describe("showStuPlacementProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render student details when found", async () => {
    const studentData = {
      _id: "66",
      isRegistered: true,
      profilePictureUrl: "profilePicUrl",
      stuId: "stuId",
    };
    Student.findOne.mockResolvedValue(studentData);
    const req = {
      query: { stuId: "66" },
      user: { profilePictureUrl: "userProfilePicUrl" },
    };
    const res = {
      render: jest.fn((x) => x),
    };
    await showStuPlacementProfile(req, res);
    expect(Student.findOne).toHaveBeenCalledWith({
      _id: "66",
    });
    expect(res.render).toHaveBeenCalledWith("resources/studentDetails.ejs", {
      stuDetails: studentData,
      isRegistered: studentData.isRegistered,
      profilePictureUrl: "userProfilePicUrl",
      stuId: studentData._id,
    });
  });
});

describe("renderApplyForm", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        listingId: "listingId",
        stuId: "studentId",
      },
      flash: jest.fn(),
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    Listing.findOne.mockResolvedValue({
      companyName: "companyname",
      jobType: "jobType",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Renders Application page successfully when student is not deboarded", async () => {
    Student.findOne.mockResolvedValue({ isDeboarded: false });

    await renderApplyForm(req, res);

    expect(Listing.findOne).toHaveBeenCalledWith({ _id: "listingId" });
    expect(Student.findOne).toHaveBeenCalledWith({ _id: "studentId" });

    expect(res.render).toHaveBeenCalledWith(
      "resources/apply.ejs",
      expect.objectContaining({
        listingId: "listingId",
        stuId: "studentId",
        stuDetails: expect.objectContaining({ isDeboarded: false }),
        companyname: "companyname",
        jobType: "jobType",
      })
    );
  });

  it("Redirects to account page and shows your account disabled flash if student is deboarded", async () => {
    Student.findOne.mockResolvedValue({ isDeboarded: true });

    await renderApplyForm(req, res);

    expect(Listing.findOne).toHaveBeenCalledWith({ _id: "listingId" });
    expect(Student.findOne).toHaveBeenCalledWith({ _id: "studentId" });

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Your Account has been Disabled by the Admin. Please Contact the Administration for further Information."
    );
    expect(res.redirect).toHaveBeenCalledWith("/account");
    expect(res.render).not.toHaveBeenCalled();
  });
});

describe("submitApply", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        listingId: "listingId123",
        stuId: "stuId123",
      },
      file: {
        path: "path/to/resume.pdf",
      },
      user: {
        isDeboarded: false,
      },
      flash: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should flash an error if the student has already applied", async () => {
    Application.find.mockResolvedValue([{ _id: "applicationId123" }]);
    Listing.findOne.mockResolvedValue({});

    await submitApply(req, res);

    expect(Application.find).toHaveBeenCalledWith({
      stuId: "stuId123",
      listingId: "listingId123",
    });
    expect(Listing.findOne).toHaveBeenCalledWith({
      _id: "listingId123",
    });
    expect(req.flash).toHaveBeenCalledWith("error", "Already Applied !");
    expect(res.redirect).toHaveBeenCalledWith("/account");
  });

  test("should redirect with an error if the user is deboarded", async () => {
    req.user.isDeboarded = true;
    Application.find.mockResolvedValue([]);
    Listing.findOne.mockResolvedValue({});

    await submitApply(req, res);

    expect(Application.find).toHaveBeenCalledWith({
      stuId: "stuId123",
      listingId: "listingId123",
    });
    expect(Listing.findOne).toHaveBeenCalledWith({
      _id: "listingId123",
    });
    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Your Account has been Disabled by the Admin. Please Contact the Administration for further Information."
    );
    expect(res.redirect).toHaveBeenCalledWith("/account");
  });

  test("should save a new application and redirect with a success message", async () => {
    Application.find.mockResolvedValue([]);
    Listing.findOne.mockResolvedValue({});
    Application.prototype.save = jest.fn().mockResolvedValue({});

    await submitApply(req, res);

    expect(Application.find).toHaveBeenCalledWith({
      stuId: "stuId123",
      listingId: "listingId123",
    });
    expect(Listing.findOne).toHaveBeenCalledWith({
      _id: "listingId123",
    });
    expect(Application.prototype.save).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Application Submitted Succesfully !"
    );
    expect(res.redirect).toHaveBeenCalledWith("/account");
  });
});

describe("renderQueryForm", () => {
  beforeEach(() => {
    req = {
      user: { _id: "123", profilePictureUrl: "abc" },
    };
    res = {
      render: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the ask query form ", async () => {
    Query.find.mockResolvedValue({});

    await renderQueryForm(req, res);
    expect(Query.find).toHaveBeenCalledWith({ stuId: "123" });
    expect(Query.find).toHaveBeenCalledTimes(1);
    expect(Query.find).toHaveBeenLastCalledWith({ stuId: "123" });

    expect(res.render).toHaveBeenCalledWith(
      "resources/askquery.ejs",
      expect.objectContaining({
        isRegistered: true,
        profilePictureUrl: "abc",
        stuId: "123",
        allQueries: {},
      })
    );
  });
});

describe("submitStudentQuery", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        subject: "title",
        query: "hilorem",
      },
      session: {
        save: jest.fn(),
      },
      flash: jest.fn(),
      user: {
        _id: "123",
      },
    };
    res = {
      redirect: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should submit the query if is not too long", async () => {
    Query.prototype.save.mockResolvedValue({});
    await submitStudentQuery(req, res);

    expect(Query.prototype.save).toHaveBeenCalledTimes(1);
    expect(req.flash).toHaveBeenCalledTimes(1);
    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Query Submitted Successfully !"
    );
    expect(req.session.save).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/account/askqueries");
  });

  it("should not submit the query if is too long", async () => {
    req.body.query =
      " Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magni, ipsam, deleniti eum placeat odit id voluptatum repellendus quibusdam dolorum ratione consectetur itaque nam, natus dolores at. Sapiente, nihil autem.";

    await submitStudentQuery(req, res);
    expect(req.flash).toHaveBeenCalledTimes(1);
    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Query should be less than 100 words"
    );
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/account/askqueries");
  });
});
