/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');

let itemsCreated = [];

const subfolderUrl = /[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}\/[0-9]+/;
describe('Navigation', () => {
  context(viewports.desktop.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    });

    it('single click selects folder without navigation', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);

      cy.url().should('not.match', subfolderUrl);

      helpers.fileList.deleteItem(folderName, true);
    });

    it('double click navigates into folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolder(folderName);
      helpers.fileList.doubleClickItem(folderName);

      cy.url().should('match', subfolderUrl);
      cy.get('.breadcrumbs').contains(folderName).should('exist');
      cy.get('.breadcrumbs').contains('My Files').click();
      cy.url().should('not.match', subfolderUrl);

      helpers.fileList.deleteItem(folderName);
    });
  });

  context(viewports.mobile.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
    });

    it('single click navigates into folder and My Files breadcrumb works', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      helpers.fileList.clickItem(folderName, true);

      cy.url().should('match', subfolderUrl);
      cy.get('.breadcrumbs').contains(folderName).should('exist');
      cy.get('.breadcrumbs').contains('My Files').click();
      cy.url().should('not.match', subfolderUrl);

      helpers.fileList.deleteItemMobile(folderName);
    });
  })
});