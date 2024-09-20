import { } from "../../../cy-configs/cypress/support/index.js";
import { do_enrollment } from "../../../cy-configs/cypress/support/index.js";
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import MFA from "../pages/MFA.js";

var lm_number, lm_account_pass;
let entrar = function (user, pass) {
    cy.login(user, pass)
    cy.setCookie("lng-stg", "en");
    cy.setCookie('cty-app', 'us');
    cy.setCookie('cty-stg', 'us');
    cy.setCookie("cookiePolicyAccepted", "true");
};

let enroll = function () {
    do_enrollment()
        .then((resp) => {
            // Se guarda el lm_number creado desde enrollment para utilizarlo después en la prueba:
            cy.wrap(resp).as("lm_number");
            lm_number = resp;
            Cypress.env("lm_number", resp);
            // Se ha iniciado la session
            cy.encryptPassword("Lifemiles1").then((encryptedPassword) => {
                lm_account_pass = encryptedPassword
                entrar(lm_number, encryptedPassword)
            })
        })
        .catch((error) => {
            cy.log("Error en el enrolamiento: " + error);
        });
}


When("Go to the account profile section", function () {
    cy.readFile("cypress/fixtures/temp-token.json").then((json) => { });
    cy.intercept("**/lac-get-countries-per-law").as("profile");
    cy.setCookie("cookiePolicyAccepted", "true");
    cy.visit("/account/profile", { failOnStatusCode: false });
    cy.wait("@profile");
});

Then("Validate to redirect to {string}", function (section) {
    cy.url().should("include", section);
});

When("I go to the section 2-Step verification", function () {
    cy.intercept("**/mfa-member-details/LMWEB").as("TwoFA");
    cy.visit("/account/profile", { failOnStatusCode: false });
    cy.wait("@TwoFA");
    scrollTo(0, 2000);
});

Then("I click on the Active button", function () {
    MFA.elements.activarMFABtn().click();
});

When("I select the Google Authenticator option and click on the Select button", function () {
    MFA.elements.selectGoogleBtn().click();
});

Then("I type the {string} generated by Google Authenticator App in the boxes in four step", function (OTPcode) {
    MFA.elements.titleMethod().contains("Google Authenticator");
    MFA.elements.firstInput().click().type(OTPcode);
});

When("I click on the Active method button", function () {
    MFA.elements.activeMethodBtn().click();
});

Then("Validate the confirmation message 2-Step verification is turned on in the modal", function () {
    MFA.elements.titleModalConfirmatitionActive().contains("2-Step verification is turned on");
});

When("I click on the Close button", function () {
    MFA.elements.cerrarModalBtn().click();
});

Then("Validate that the view has been changed", function () {
    MFA.elements.confirmationSectionMFAActive().contains("You have enabled 2-step verification on your account.");
});

When("I loggin with account with app method of MFA Active", function () {
    entrar(lm_number, lm_account_pass)
    cy.readFile("cypress/fixtures/temp-token.json").then((json) => { });
    cy.intercept("**/lac-get-countries-per-law").as("profile");
    cy.setCookie("cookiePolicyAccepted", "true");
    cy.visit("/account/profile", { failOnStatusCode: false });
    cy.wait("@profile");
    cy.intercept("**/mfa-member-details/LMWEB").as("TwoFA");
    cy.visit("/account/profile", { failOnStatusCode: false });
    cy.wait("@TwoFA");
    scrollTo(0, 2000);
});

When("I click on the Disable button", function () {
    MFA.elements.desactivarMFABtn().click();
});

Then("The modal displayed with the title Security Alert", function () {
    MFA.elements.alertaSegundad().contains("Security alert");
});

When("I click on the I read the recommendation and decided not to enable 2-step verification checkbox", function () {
    MFA.elements.acceptDesactivarTermsCheck().click();
});

Then("I click on the Continue button", function () {
    MFA.elements.continuarFlujoDesactivacionBtn().click();
});

When("I type the {string} for identity confirmation", function (OTPcode) {
    MFA.elements.firstInput().click().type(OTPcode);
});

Then("I click on the Next button", function () {
    MFA.elements.validarOTPDesactivacionBtn().click();
});

When("Validate the confirmation message 2-Step verification was not turned on", function () {
    MFA.elements.titleModalConfirmationDesactivacion().contains("2-Step verification has been turned off");
});

Then("I click on the Close button for ending flow", function () {
    MFA.elements.cerrarModalDesactivacionBtn().click();
});

When("I select the Microsoft Authenticator option and click on the Seleccionar button", function () {
    MFA.elements.selectMicrosoftBtn().click();
});

Then("I type the {string} generated by Microsoft Authenticator App in the boxes in four step", function (OTPcode) {
    MFA.elements.titleMethod().contains("Microsoft Authenticator");
    MFA.elements.firstInput().click().type(OTPcode);
});

Then("I click on the Change method button", function () {
    MFA.elements.changeMethodBtn().click();
});

When("I verify that a method is available", function () {
    MFA.elements.selectAvailableMethodSMS().should("have.length", 1);
});

Then("I select the unique method Text Message SMS option and click on the Select button", function () {
    MFA.elements.changeMethodToSMSBtn().click();
});


Then("I select the country with its {string} and enter the {string}", function (phoneArea, phoneNumber) {
    MFA.elements.dropdownPhoneArea().select(phoneArea);
    MFA.elements.textPhoneNumber().click().type(phoneNumber);
});

When("I click on the Send SMS button", function () {
    MFA.elements.sendSMSBtn().click();
});

Then("I type the {string} send SMS for phone number in the boxes in four step", function (OTPcode) {
    MFA.elements.titleMethodSMS().contains("2-Step verification via text message (SMS)");
    MFA.elements.firstInput().click().type(OTPcode);
});

When("I click on the Active SMS method button", function () {
    MFA.elements.activeMethdoSMSBtn().click();
});

When("I verify that a methods is available", function () {
    MFA.elements.appMethodAvailableSection().within(() => {
        MFA.elements.appMethodGoogleAvailable().should('exist');
        MFA.elements.appMethodMicrosoftAvailable().should('exist');
    });
});

Then("I select only one to the two methods option Google or Microsoft Authenticator click on the Seleccionar button", function () {
    MFA.elements.selectMethodMicrosoftBtn().click();
});

When("I select the Text Message option and click on the Select button", function () {
    MFA.elements.selectSMSBtn().click();
});

When("I select the new country with its {string} and enter the new {string}", function (phoneAreaTwo, phoneNumberTwo) {
    MFA.elements.dropdownPhoneArea().select(phoneAreaTwo);
    MFA.elements.textPhoneNumber().should("be.visible").click({ force: true }).invoke("val", "").type(phoneNumberTwo);
});

Then("I clik on the Resend OTP link", function () {
    MFA.elements.sendAnotherOTPCode().click();
    MFA.elements.notificationSendNewOTPCode().contains("OTP sent");
});

Then("I click on the Change phone link", function () {
    MFA.elements.changeNumberPhone().click();
});


Then("I click on the Next button to finish the flow of confirming the identity with the SMS method", function () {
    MFA.elements.confirmIdentitySMSBtn().click();
});


When("I sign in with new account", function () {
    enroll()
});

Then("I click the Resend OTP many times", function () {
    for (let i = 1; i <= 9; i++) {
        cy.intercept("**/svc/mfa/core/code/generate").as("generate");
        MFA.elements.sendAnotherOTPCode().click();
        MFA.elements.notificationSendNewOTPCode().contains("OTP sent");
        cy.wait("@generate");
        MFA.elements.notificationSendNewOTPCode().should('not.exist');
        cy.log(i.toString());
    }
    cy.intercept("**/svc/mfa/core/code/generate").as("generate");
    MFA.elements.sendAnotherOTPCode().click();
    MFA.elements.titleModalMaximumNumberSMSReached().contains("We're sorry!").should('exist');
    cy.wait("@generate");
});


Then("I validate the display of the maximum number of SMS reached modal", function () {
    MFA.elements.titleModalMaximumNumberSMSReached().contains("We're sorry!");
    MFA.elements.subTitleModalMaximunNumberSMSReached().contains("You have reached the maximum amount of allowed SMS. Try again 24 hours after the last succesful request.");
});
