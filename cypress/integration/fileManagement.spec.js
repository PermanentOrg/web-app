/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
import { count } from 'console';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

const filesFolderName = archives.filesFolderName;

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

    it('copies a single image', () => {
      const copyDestName = `Copy Here ${Date.now()}`;

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

    it('copies multiple images', () => {
      const copyDestName = `Copy Here ${Date.now()}`;
      const countToCopy = 5;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.createFolder(copyDestName);
      cy.contains('.file-list-item', 'Image').click();
      helpers.fileList.multiSelectNextItems(countToCopy - 1);
      helpers.fileList.shouldHaveCountSelected(countToCopy);
      helpers.fileList.clickItemAction('Copy');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.clickFolderPickerItem(copyDestName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.message.shouldShowMessage('copied successfully');
      helpers.fileList.navigateToFolder(copyDestName);
      helpers.fileList.shouldHaveItemCount(countToCopy);
      helpers.navigation.clickBreadcrumbItem(filesFolderName);
      helpers.fileList.deleteItem(copyDestName);
    });

    it('copies a single folder', () => {
      const newFolderName = `New Folder ${Date.now()}`
      const copyDestName = `Copy Here ${Date.now()}`;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.createFolder(copyDestName);
      helpers.fileList.createFolder(newFolderName);
      helpers.fileList.clickItem(newFolderName);
      helpers.fileList.clickItemAction('Copy');
      helpers.folderPicker.clickFolderPickerItem(copyDestName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.message.shouldShowMessage('copied successfully');
      helpers.fileList.navigateToFolder(copyDestName);
      helpers.fileList.shouldHaveItemCount(1);
      helpers.navigation.clickBreadcrumbItem('My Files');
      helpers.fileList.deleteItem(copyDestName);
      helpers.fileList.deleteItem(newFolderName);
    });

    it('copies multiple folders', () => {
      const newFolderName = `New Folder ${Date.now()}`
      const newFolder2Name = `New Folder 2 ${Date.now()}`
      const newFolder3Name = `New Folder 3 ${Date.now()}`
      const copyDestName = `Copy Here ${Date.now()}`;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.createFolder(copyDestName);
      helpers.fileList.createFolder(newFolderName);
      helpers.fileList.createFolder(newFolder2Name);
      helpers.fileList.createFolder(newFolder3Name);
      helpers.fileList.clickItem(newFolderName);
      helpers.fileList.clickItem(newFolder2Name, null, '{ctrl}');
      helpers.fileList.clickItem(newFolder3Name, null, '{ctrl}');
      helpers.fileList.clickItemAction('Copy');
      helpers.folderPicker.clickFolderPickerItem(copyDestName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.fileList.navigateToFolder(copyDestName);
      cy.reload();
      helpers.fileList.shouldHaveItemCount(3);
      cy.visit('/m/myfiles');
      helpers.fileList.deleteItems([copyDestName, newFolderName, newFolder2Name, newFolder3Name]);
    });

    it.skip('moves a single image', () => {
      const moveDestname = `Move Here ${Date.now()}`;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.createFolder(moveDestname);
      cy.contains('.file-list-item', 'Image').click();
      helpers.fileList.clickItemAction('Move');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.clickFolderPickerItem(moveDestname);
      helpers.folderPicker.confirmPickerOperation();
      helpers.message.shouldShowMessage('moved successfully');
      helpers.fileList.navigateToFolder(moveDestname);
      helpers.fileList.shouldHaveItemCount(1);
      cy.contains('.file-list-item', 'Image').click();
      helpers.fileList.clickItemAction('Move');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.fileList.shouldHaveItemCount(0);
      helpers.navigation.clickBreadcrumbItem(filesFolderName);
      helpers.fileList.deleteItem(moveDestname);
    });

    it.skip('moves multiple images', () => {
      const moveDestName = `Move Here ${Date.now()}`;
      const countToMove = 5;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.createFolder(moveDestName);
      cy.contains('.file-list-item', 'Image').click();
      helpers.fileList.multiSelectNextItems(countToMove - 1);
      helpers.fileList.shouldHaveCountSelected(countToMove);
      helpers.fileList.clickItemAction('Move');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.clickFolderPickerItem(moveDestName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.message.shouldShowMessage('moved successfully');
      helpers.fileList.navigateToFolder(moveDestName);
      cy.reload();
      helpers.fileList.shouldHaveItemCount(countToMove);
      helpers.fileList.selectAll();
      helpers.fileList.clickItemAction('Move');
      helpers.folderPicker.clickFolderPickerItem(filesFolderName);
      helpers.folderPicker.confirmPickerOperation();
      helpers.fileList.shouldHaveItemCount(0);
      helpers.navigation.clickBreadcrumbItem(filesFolderName);
      helpers.navigation.breadcrumbsShouldNotContain(moveDestName);
      helpers.fileList.deleteItem(moveDestName);
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