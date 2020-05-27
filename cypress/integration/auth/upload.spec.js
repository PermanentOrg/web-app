/// <reference types="Cypress" />

import * as helpers from '../../helpers/index';
const accounts = require('../../fixtures/accounts.json');

describe.skip('Upload', () => {
  it('uploads one file successfully', () => {
    helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
    cy.url().should('contain', 'myfiles');
  });
});