/// <reference types="Cypress" />

export function shouldBeVisible() {
  cy.get('pr-file-viewer').should('be.visible');
}