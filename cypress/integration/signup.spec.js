/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const accounts = require('../fixtures/accounts.json');

describe('Signup', () => {
  it.skip('signs up successfully', () => {
    const newEmail = `tstr+${Date.now()}@permanent.org`;
    helpers.auth.signUp(newEmail, newEmail, accounts.testAccount.password);
    cy.url({timeout: 15000}).should('contain', 'myfiles');
  });

  it('shows an error when an email is in use', () => {
    helpers.auth.signUp(accounts.testAccount.email, accounts.testAccount.email, accounts.testAccount.password);
    cy.get('.alert').should('be.visible');
    cy.get('pr-message').should('contain.text', 'already in use');
  });

  it('doesn\'t allow signup when email is invalid', () => {
    cy.visit('/m/auth/signup');
    cy.url().should('contain', 'signup');
    cy.get('input#name').type(accounts.testAccount.email);
    cy.get('input#email').type('thisisntanemail');
    cy.get('input#password').type(accounts.testAccount.password);
    cy.get('input#confirm').type(accounts.testAccount.password);
    cy.get('input#terms').click();
    cy.get('input#email').should('have.class', 'ng-invalid');
  });

  it('doesn\'t allow signup when passwords mismatch', () => {
    cy.visit('/m/auth/signup');
    cy.url().should('contain', 'signup');
    cy.get('input#name').type(accounts.testAccount.email);
    cy.get('input#email').type(accounts.testAccount.email);
    cy.get('input#password').type(accounts.testAccount.password);
    cy.get('input#confirm').type('mismatched');
    cy.get('input#terms').click();
    cy.get('input#confirm').should('have.class', 'ng-invalid');
  });
});