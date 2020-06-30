/// <reference types="Cypress" />

export function clickModalButton(buttonText) {
  cy.contains('.dialog-content .btn', buttonText).click();
}