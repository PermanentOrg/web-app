/// <reference types="Cypress" />


export function logIn(email, password) {
  cy.clearCookies({domain: null});
  cy.visit('/m/auth/login');
  cy.url().should('contain', 'login');
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('button.btn').click();
}

export function signUp(name, email, password) {
  cy.clearCookies({domain: null});
  cy.visit('/m/auth/signup');
  cy.url().should('contain', 'signup');
  cy.get('input#name').type(name);
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('input#confirm').type(password);
  cy.get('input#terms').click();
  cy.get('button.btn').click();
}

export function switchArchive(archiveName) {
  cy.visit('/m/choosearchive');
}
