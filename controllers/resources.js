module.exports.showResourcesForStudents = (req, res) => {
  return res.render("resources/resourcesstudent.ejs");
};

module.exports.showResourcesForRecruiters = (req, res) => {
  return res.render("resources/resrecru.ejs");
};
