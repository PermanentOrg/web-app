/// <reference types="Cypress" />

import * as helpers from '../../helpers/index';
const viewports = require('../../fixtures/constants.json').viewports;
const accounts = require('../../fixtures/accounts.json');

let itemsCreated = [];

describe('File Management', () => {
  context(viewports.desktop.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    });

    it('creates a new folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolder(folderName);
      itemsCreated.push(folderName);
    });

    it('deletes a new folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolder(folderName);
      helpers.fileList.deleteItemItem(folderName);
    });
  
    it('renames a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      const newName = `rename${folderName}`;
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);
      cy.get('pr-sidebar').contains('Name').siblings('pr-inline-value-edit').click();
      cy.focused().type(`{selectall}${newName}`);
      cy.get('.inline-value-controls').contains('Save').click();
      helpers.fileList.itemExists(newName);
      itemsCreated.push(newName);
    });

    it.only('sets the description on a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      const description = `description${folderName}`;
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);
      cy.get('pr-sidebar').contains('Description').siblings('pr-inline-value-edit').click();
      cy.focused().type(`{selectall}${description}`);
      cy.get('.inline-value-controls').contains('Save').click();
      itemsCreated.push(folderName);
      cy.get('pr-sidebar').contains('.inline-value-display', description).should('exist');
    });

    after(() => {
      cy.clearCookies();
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      for (const folderName of itemsCreated) {
        helpers.fileList.deleteItemItem(folderName); 
      }
    });
  });

  context(viewports.mobile.name, () => {
    before(() => {
      itemsCreated = [];
    });

    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
    });

    it('creates a new folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      itemsCreated.push(folderName);
    });

    it('deletes a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      helpers.fileList.deleteItemItemMobile(folderName);
    });

    it('renames a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      helpers.clickItemActionMobile(folderName, 'Rename');
      const secondFolderName = `rename${folderName}`;
      helpers.typeIntoPromptField('#displayName', secondFolderName);
      helpers.clickPromptButton('Rename');
      helpers.fileList.itemExists(secondFolderName);
      itemsCreated.push(secondFolderName);
    });

    after(() => {
      cy.clearCookies();
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      for (const folderName of itemsCreated) {
        helpers.fileList.deleteItemItemMobile(folderName); 
      }
    });
  })
});