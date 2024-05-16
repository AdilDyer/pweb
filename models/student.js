const { string } = require("joi");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  profilePictureUrl: {
    type: String,
    default: "",
  },
  isDeboarded: {
    type: Boolean,
    default: false,
  },
  placedJobType: {
    type: String,
    default: "",
  },
  placedCompany: {
    type: String,
    default: "",
  },
  placedCtc: {
    type: Number,
    default: -1,
  },
  placedJobLocation: {
    type: String,
    default: "",
  },
  placedJobDescription: {
    type: String,
    default: "",
  },
  placedOtherDetails: {
    type: String,
    default: "",
  },
  placedDate: {
    type: Date,
    default: Date.now,
  },
  isPlaced: {
    type: Boolean,
    default: false,
  },
  haveResetPass: {
    type: Boolean,
  },
  tenthMarksheetUrl: {
    type: String,
  },
  twelthMarksheetUrl: {
    type: String,
  },
  isAudited: {
    type: Boolean,
  },
  isRegistered: {
    type: Boolean,
  },
  course: {
    type: String,
  },
  fullname: {
    type: String,
  },

  fathername: {
    type: String,
  },
  mothername: {
    type: String,
  },
  birthdate: {
    type: Date,
  },
  mobileno: {
    type: Number,
    //
    // minlength: 10,
    // unique: true,
    // maxlength: 10,
    // validate: {
    //   validator: function (v) {
    //     // Validate that the mobile number consists of exactly 10 digits
    //     return /^\d{10}$/.test(v);
    //   },
    //   message: (props) =>
    //     `${props.value} is not a valid mobile number! Please enter exactly 10 digits.`,
    // },
  },
  altmobileno: {
    type: Number,
  },
  email: {
    type: String,
    // unique: true,
  },
  altemail: {
    type: String,
  },
  category: {
    type: String,
  },
  nationality: {
    type: String,
  },
  presentcountry: {
    type: String,
  },
  presentstate: {
    type: String,
  },
  presentdistrict: {
    type: String,
  },
  landmark: {
    type: String,
  },
  presentaddress: {
    type: String,
  },
  gender: {
    type: String,
  },
  enrollmentNo: {
    type: Number,
  },
  pincode: {
    type: Number,

    maxlength: 6,
  },
  tenth: {
    type: Number,

    maxlength: 3,
  },
  twelth: {
    type: Number,

    maxlength: 3,
  },
  lastsemcgpa: {
    type: Number,

    maxlength: 3,
  },
  othermarksheetUrl: {
    type: String,
    default: "",
  },
  othermarks: {
    type: Number,
    default: "",
  },
  otheryearofpassing: {
    type: Number,
    default: -1,
  },
  otheryrofjoining: {
    type: Number,
    default: -1,
  },
  otherintitutename: {
    type: String,
    default: "",
  },
  otheruniversity: {
    type: String,
    default: "",
  },
  postgraduationmarksheetUrl: {
    type: String,
    default: "",
  },
  postgraduation: {
    type: Number,
    default: "",
  },
  postgraduationyearofpassing: {
    type: Number,
    default: -1,
  },
  postgraduationyrofjoining: {
    type: Number,
    default: -1,
  },
  postgraduationintitutename: {
    type: String,
    default: "",
  },
  postgraduationuniversity: {
    type: String,
    default: "",
  },
  graduationmarksheetUrl: {
    type: String,
    default: "",
  },
  graduation: {
    type: Number,
    default: "",
  },
  graduationyearofpassing: {
    type: Number,
    default: -1,
  },
  graduationyrofjoining: {
    type: Number,
    default: -1,
  },
  graduationintitutename: {
    type: String,
    default: "",
  },
  graduationuniversity: {
    type: String,
    default: "",
  },
  twelthyearofpassing: {
    type: Number,
    default: -1,
  },
  twelthyrofjoining: {
    type: Number,
    default: -1,
  },
  twelthintitutename: {
    type: String,
    default: "",
  },
  twelthBoard: {
    type: String,
    default: "",
  },
  tenthintitutename: {
    type: String,
    default: "",
  },
  tenthyearofjoining: {
    type: Number,
    default: -1,
  },
  tenthyearofpassing: {
    type: Number,
    default: -1,
  },
  tenthboard: {
    type: String,
    default: "",
  },
});
studentSchema.plugin(passportLocalMongoose); //above the below line
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
