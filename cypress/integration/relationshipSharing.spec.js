/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

let itemsCreated = [];

describe('Relationship Sharing', () => {
  context(viewports.desktop.name, () => {
    let folderName;

    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
      window.localStorage.setItem('debug', 'service:*,component*');
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      folderName = `sharing${Date.now()}`;
    });

    it('should share a folder with another archive as viewer', () => {
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.viewer');
      itemsCreated.push(folderName);

      helpers.fileList.doubleClickItem(folderName);

      helpers.fileList.createFolder('subfolder 1');
      helpers.fileList.createFolder('subfolder 2');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Viewer');

      // check permissions inside folder
      helpers.fileList.doubleClickItem(folderName);
      cy.get('.breadcrumbs').should('contain', accounts.testAccount.name).and('contain', folderName);
      helpers.fileList.clickItem('subfolder 1');
      const disabledActions = ['Delete', 'Copy', 'Move', 'Share', 'Publish'];
      for (const action of disabledActions) {
        helpers.fileList.checkItemActionDisabled(action);
      }
      helpers.elements.desktopUploadButton().should('have.class', 'disabled');
      helpers.elements.newFolderButton().should('be.disabled');
    });

    it('should share a folder with another archive as contributor', () => {
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.contributor');
      itemsCreated.push(folderName);

      helpers.fileList.doubleClickItem(folderName);

      helpers.fileList.createFolder('subfolder 1');
      helpers.fileList.createFolder('subfolder 2');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Contributor');

      // check permissions inside folder
      helpers.fileList.doubleClickItem(folderName);
      cy.get('.breadcrumbs').should('contain', accounts.testAccount.name).and('contain', folderName);
      helpers.fileList.clickItem('subfolder 1');
      const disabledActions = ['Delete', 'Copy', 'Move', 'Share', 'Publish'];
      for (const action of disabledActions) {
        helpers.fileList.checkItemActionDisabled(action);
      }
      helpers.elements.desktopUploadButton().should('not.have.class', 'disabled');
      helpers.elements.newFolderButton().should('not.be.disabled');
    });

    it('should share a folder with another archive as editor', () => {
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.editor');
      itemsCreated.push(folderName);

      helpers.fileList.doubleClickItem(folderName);

      helpers.fileList.createFolder('subfolder 1');
      helpers.fileList.createFolder('subfolder 2');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Editor');

      // check permissions inside folder
      helpers.fileList.doubleClickItem(folderName);
      cy.get('.breadcrumbs').should('contain', accounts.testAccount.name).and('contain', folderName);
      helpers.fileList.clickItem('subfolder 1');
      const disabledActions = ['Delete', 'Copy', 'Move', 'Share', 'Publish'];
      for (const action of disabledActions) {
        helpers.fileList.checkItemActionDisabled(action);
      }
      helpers.elements.desktopUploadButton().should('not.have.class', 'disabled');
      helpers.elements.newFolderButton().should('not.be.disabled');
    });


    it('should share a folder with another archive as curator', () => {
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.curator');
      itemsCreated.push(folderName);

      helpers.fileList.doubleClickItem(folderName);

      helpers.fileList.createFolder('subfolder 1');
      helpers.fileList.createFolder('subfolder 2');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Curator');

      // check permissions inside folder
      helpers.fileList.doubleClickItem(folderName);
      cy.get('.breadcrumbs').should('contain', accounts.testAccount.name).and('contain', folderName);
      helpers.fileList.clickItem('subfolder 1');
      const enabledActions = ['Delete', 'Copy', 'Move'];
      for (const action of enabledActions) {
        helpers.fileList.checkItemActionEnabled(action);
      }

      const disabledActions = ['Share', 'Publish'];
      for (const action of disabledActions) {
        helpers.fileList.checkItemActionDisabled(action);
      }

      helpers.elements.desktopUploadButton().should('not.have.class', 'disabled');
      helpers.elements.newFolderButton().should('not.be.disabled');
    });

    it.only('should share a folder with another archive as owner', () => {
      helpers.sharing.createAndShareFolder(folderName, archives.shareWithArchive, 'access.role.owner');
      itemsCreated.push(folderName);

      helpers.fileList.doubleClickItem(folderName);

      helpers.fileList.createFolder('subfolder 1');
      helpers.fileList.createFolder('subfolder 2');

      helpers.archive.switchToArchive(archives.shareWithArchive);

      cy.contains('Shares').click();
      helpers.sharing.shareExists(folderName, 'Owner');

      // check permissions inside folder
      helpers.fileList.doubleClickItem(folderName);
      cy.get('.breadcrumbs').should('contain', accounts.testAccount.name).and('contain', folderName);
      helpers.fileList.clickItem('subfolder 1');
      const enabledActions = ['Delete', 'Copy', 'Move', 'Share', 'Publish'];
      for (const action of enabledActions) {
        helpers.fileList.checkItemActionEnabled(action);
      }
      helpers.elements.desktopUploadButton().should('not.have.class', 'disabled');
      helpers.elements.newFolderButton().should('not.be.disabled');
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