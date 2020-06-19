/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');

let itemsCreated = [];

describe('File Management', () => {
  context(viewports.desktop.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    });

    it('creates and deletes a new folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolder(folderName);
      helpers.fileList.deleteItem(folderName);
    });
  
    it('renames a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      const newName = `rename${folderName}`;
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);
      helpers.elements.sidebarFieldByName('Name').find('.can-edit').should('exist');
      cy.get('pr-sidebar').contains('Name').siblings('pr-inline-value-edit').click();
      cy.focused().type(`{selectall}${newName}`);
      cy.get('.inline-value-controls').contains('Save').click();
      helpers.fileList.itemExists(newName);
      helpers.fileList.deleteItem(newName, true);
    });

    it('sets the description on a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      const description = `description${folderName}`;
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);
      cy.contains('pr-inline-value-edit', 'Click to add description').click();
      cy.focused().scrollIntoView().type(`{selectall}${description}`);
      cy.get('.inline-value-controls').contains('Save').scrollIntoView().click();
      cy.get('pr-sidebar').contains('.inline-value-display', description).should('exist');
      helpers.fileList.deleteItem(folderName, true);
    });

    it.only('copies a single image', () => {
      const copyDestName = `Copy Here ${Date.now()}`;
      const filesFolderName = 'Files For Test';

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.createFolder(copyDestName);
      cy.contains('.file-list-item', 'Image').click();
      helpers.fileList.clickItemAction('Copy');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.clickFolderPickerItem(copyDestName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.message.shouldShowMessage('copied successfully');
      helpers.fileList.navigateToFolder(copyDestName);
      helpers.fileList.shouldHaveItemCount(1);
      helpers.navigation.clickBreadcrumbItem(filesFolderName);
      helpers.fileList.deleteItem(copyDestName);
    });
  });

  context(viewports.mobile.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
    });

    it('creates and deletes a new folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      helpers.fileList.deleteItemMobile(folderName);

    });

    it('renames a folder', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      const folderName = Date.now();
      helpers.fileList.createFolderMobile(folderName);
      helpers.fileList.clickItemActionMobile(folderName, 'Rename');
      const secondFolderName = `rename${folderName}`;
      helpers.prompt.typeIntoPromptField('#displayName', secondFolderName);
      helpers.prompt.clickPromptFieldButton('Rename');
      helpers.fileList.itemExists(secondFolderName);
      helpers.fileList.deleteItemMobile(secondFolderName);
    });
  })
});