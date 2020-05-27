/// <reference types="Cypress" />
import { MailSlurp } from 'mailslurp-client';
import promisify from 'cypress-promise'
import * as helpers from '../../helpers/index';
const accounts = require('../../fixtures/accounts.json');
const apiKeys = require('../../fixtures/constants.json').apiKey;
const mailslurp = new MailSlurp({apiKey: apiKeys.mailslurp});

describe('Login', () => {
  it('logs in successfully (no MFA)', () => {
    helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
    cy.url().should('not.contain', /login/);
  });

  it.skip('logs in successfully (with MFA)', () => {
    helpers.auth.logIn(accounts.mailslurpDev.email, accounts.mailslurpDev.password);
    cy.url().should('contain', 'mfa').then(() => {
      cy.log(accounts.mailslurpDev.inboxId);
      cy.wrap(mailslurp.waitForLatestEmail(accounts.mailslurpDev.inboxId)).then((email) => {
        expect(email.body).to.contain('verification code');
        const regEx = /code is: ([0-9]{4})/;
        const mfaCode = regEx.exec(email.body)[1];
        expect(mfaCode).to.exist.and.to.have.length(4);
        cy.get('input#token').type(mfaCode);
        cy.get('.btn').click();
        cy.url().should('contain', 'myfiles');
      })
    })
  });

  it('fails to login with incorrect email', () => {
    helpers.auth.logIn('wrong@wrong.com', accounts.testAccount.password);
    cy.get('.alert').should('be.visible');
    cy.get('pr-message').should('contain.text', 'Incorrect email or password.');
    cy.get('input#password').should('have.class', 'ng-invalid');
  });

  it('fails to login with incorrect password', () => {
    helpers.auth.logIn(accounts.testAccount.email, 'wrongpassword');
    cy.get('.alert').should('be.visible');
    cy.get('pr-message').should('contain.text', 'Incorrect email or password.');
    cy.get('input#password').should('have.class', 'ng-invalid');
  });

  it('logs out successfully', () => {
    helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
    cy.get('pr-account-dropdown > .btn').click();
    cy.get('.account-dropdown-menu > :nth-child(2)').click();
    cy.url().should('contain', 'login');
  });
});