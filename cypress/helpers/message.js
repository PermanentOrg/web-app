/// <reference types="Cypress" />

export function shouldShowMessage(messageText) {
  cy.get('pr-message').should('contain.text', messageText);
}