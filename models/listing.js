const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
  isDreamOffer: {
    type: Boolean,
    default: false,
  },
  jobDescriptionFile: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  forCourse: {
    type: [
      {
        type: String,
      },
    ],
    required: true,
  },
  jobDescription: {
    type: String,
  },
  ctc: {
    type: Number,
    required: true,
  },
  lastDateToApply: {
    type: Date,
    required: true,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
