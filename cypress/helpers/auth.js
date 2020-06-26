/// <reference types="Cypress" />

import * as navigation from './navigation';

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

export function logOut() {
  cy.get('pr-account-dropdown > .btn').click();
  cy.get('.account-dropdown-menu').contains('Log Out').click();
  cy.url().should('contain', 'login');
}

export function logOutMobile() {
  navigation.clickLeftMenuItemMobile('Log Out');
  cy.url().should('contain', 'login');
}

export function switchArchive(archiveName) {
  cy.visit('/m/choosearchive');
}
