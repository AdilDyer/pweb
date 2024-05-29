describe("Homepage to login of Student", () => {
  it("should open the login page", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:8080/");
    cy.get('[data-cy="forstudents"]').click();
    cy.get('[data-cy="loginlinknavbar"]').should("exist").click();
    cy.url().should("include", "/auth/login-student");
    // cy.get("[data-cy='usernameInputStuLogin']").type("PL-MTADSAI-35");
    // cy.get("[data-cy='passwordInputStuLogin']").type(
    //   "c9958379-4885-4854-b10d-56e6c1120b36"
    // );
    cy.get("[data-cy='registerherebtn']").should("exist").click();
    cy.url().should("include", "/auth/otp-initialize?username=Student");

    function getRandomFullName() {
      const firstNames = [
        "Gunjan",
        "Priya",
        "Mohan",
        "Hrithik",
        "Hemopadini",
        "Kashyap",
      ];
      const lastNames = [
        "Sharma",
        "Kathiawad",
        "Ghorakbandhu",
        "Bhattacharya",
        "Chouhan",
        "Lal",
      ];

      const randomFirstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName =
        lastNames[Math.floor(Math.random() * lastNames.length)];

      return `${randomFirstName} ${randomLastName}`;
    }
    function getRandomEnrollNo() {
      let no = Math.floor(Math.random() * 10000000) + 10000000;
      return no;
    }

    const randomName = getRandomFullName();
    const randomEnrollNo = getRandomEnrollNo();
    const email = "aaddiillllllllll@gmail.com";
    const mobNo = 9252180504;
    cy.get("[data-cy='studentregisinputname']")
      .should("exist")
      .type(randomName);
    cy.get("[data-cy='studentregisenrollNo']")
      .should("exist")
      .type(randomEnrollNo);
    cy.get("[data-cy='studentregisemail']").should("exist").type(email);
    cy.get("[data-cy='studentregisMobNo']").should("exist").type(mobNo);
    cy.get("[data-cy='studentregisSubmitBtn']").should("exist").click();
  });
});
