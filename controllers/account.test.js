// const { showAccount } = require("./account");

// describe("showAccount function", () => {
//   it("should render the user's account page for a student", async () => {
//     // Mocking request and response objects
//     const req = {
//       user: {
//         isRegistered: true,
//         _id: "user_id_here",
//         course: "Computer Science", // Assuming a course is provided
//         profilePictureUrl: "profile_picture_url_here",
//         isPlaced: false,
//         isDeboarded: false,
//       },
//     };
//     const res = {
//       render: jest.fn(),
//     };

//     // Calling the function
//     await showAccount(req, res);

//     // Assertions
//     expect(res.render).toHaveBeenCalledWith("users/youraccountstu.ejs", {
//       isRegistered: true,
//       stuId: "user_id_here",
//       profilePictureUrl: "profile_picture_url_here",
//       availableListings: expect.any(Array),
//       appliedListings: expect.any(Array),
//       updatesToShow: expect.any(Array),
//       isPlaced: false,
//       isDeboarded: false,
//       countAppliedListings: expect.any(Number),
//       countAvailableListings: expect.any(Number),
//       studentApplications: expect.any(Array),
//       stuDetails: req.user,
//     });
//   }, 30000);

//   // You might want to add more specific test cases to cover different scenarios
// });
