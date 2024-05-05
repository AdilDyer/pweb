const mongoose = require("mongoose");
const Student = require("../models/student");
const querySchema = new mongoose.Schema({
  subject: { type: String },
  query: { type: String },
  createdAt: { type: Date, default: Date.now },
  markedAsResolved: { type: Boolean, default: false },
  reply: { type: String, default: "Pending" },
  stuId: {
    type: mongoose.Types.ObjectId,
    ref: Student,
  },
});

const Query = mongoose.model("Query", querySchema);

module.exports = Query;
