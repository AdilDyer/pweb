const mongoose = require("mongoose");
const adminSettingSchema = new mongoose.Schema({
  furtherStudentRegisEnabled: {
    type: Boolean,
  },
});

const AdminSetting = mongoose.model("AdminSetting", adminSettingSchema);

module.exports = AdminSetting;
