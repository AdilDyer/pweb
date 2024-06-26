const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
  isDown: {
    type: Boolean,
    default: false,
  },
  isDreamOffer: {
    type: Boolean,
    default: false,
  },
  jobDescriptionFiles: {
    type: Object,
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
  jobTitles: {
    type: Object,
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
