/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

let itemsCreated = [];

describe('Relationship Sharing', () => {
  context(viewports.desktop.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
      window.localStorage.setItem('debug', 'service:*,component*');
    });

    it('should share a folder with another archive as viewer', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      const folderName = `sharing${Date.now()}`;
      itemsCreated.push(folderName);
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.viewer');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Viewer');
    });

    it('should share a folder with another archive as editor', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      const folderName = `sharing${Date.now()}`;
      itemsCreated.push(folderName);
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.editor');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Editor');
    });

    after(() => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      for (const folderName of itemsCreated) {
        helpers.fileList.deleteItem(folderName); 
      }
    });
  });

  context(viewports.mobile.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
      window.localStorage.setItem('debug', 'service:*,component*');
    });

    it('should open sharing prompt for folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      const folderName = `sharing${Date.now()}`;
      helpers.fileList.createFolderMobile(folderName);
      itemsCreated.push(folderName);
      helpers.fileList.clickItemActionMobile(folderName, 'Share');
      cy.get('pr-sharing').should('be.visible');
    });

    after(() => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      for (const folderName of itemsCreated) {
        helpers.fileList.deleteItemMobile(folderName); 
      }
    });
  })
});