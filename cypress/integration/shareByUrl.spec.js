/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

const filesFolderName = archives.filesFolderName;

const SHARE_PREVIEW_DISABLED_COUNT = 20;

describe('Sharing by URL', () => {
  context(viewports.desktop.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    });

    it('should create a share link for a file', () => {
      const filename = archives.fileToShare;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(filename);
      helpers.fileList.clickItemAction('Share');
      helpers.modal.clickModalButton('Get share link');
      helpers.sharing.getShareLink((shareLink) => {
        helpers.modal.clickModalButton('Done');
        helpers.auth.logOut();
        cy.visit(shareLink);
        helpers.sharing.checkShareAccount(accounts.testAccount.name);
        helpers.sharing.checkShareArchive(archives.mainArchive);
        helpers.sharing.checkShareTitle(filename);
        helpers.navigation.breadcrumbsShouldContain(filename);
        helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
        helpers.fileList.clickItem(filename);
        helpers.fileList.clickItemAction('Share');
        helpers.modal.clickModalButton('Remove link');
        helpers.prompt.clickPromptButton('Remove link');
      });
    });

    it('should create a share link for a folder with share preview disabled', () => {
      const folderName = archives.folderToShare;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(folderName);
      helpers.fileList.clickItemAction('Share');
      helpers.modal.clickModalButton('Get share link');
      helpers.sharing.getShareLink((shareLink) => {
        helpers.modal.clickModalButton('Done');
        helpers.auth.logOut();
        cy.visit(shareLink);
        helpers.sharing.checkShareAccount(accounts.testAccount.name);
        helpers.sharing.checkShareArchive(archives.mainArchive);
        helpers.sharing.checkShareTitle(folderName);
        helpers.navigation.breadcrumbsShouldContain(folderName);
        helpers.fileList.shouldHaveItemCount(SHARE_PREVIEW_DISABLED_COUNT);
        helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
        helpers.fileList.clickItem(folderName);
        helpers.fileList.clickItemAction('Share');
        helpers.modal.clickModalButton('Remove link');
        helpers.prompt.clickPromptButton('Remove link');
      });
    });

    it('should create a share link for a folder with share preview enabled', () => {
      const folderName = archives.folderToShare;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(folderName);
      helpers.fileList.clickItemAction('Share');
      helpers.modal.clickModalButton('Get share link');
      helpers.modal.clickModalButton('Manage link');
      helpers.prompt.selectValueInPromptField('#previewToggle', 'on');
      helpers.prompt.clickPromptFieldButton('Save');
      helpers.sharing.getShareLink((shareLink) => {
        helpers.modal.clickModalButton('Done');
        helpers.auth.logOut();
        cy.visit(shareLink);
        helpers.sharing.checkShareAccount(accounts.testAccount.name);
        helpers.sharing.checkShareArchive(archives.mainArchive);
        helpers.sharing.checkShareTitle(folderName);
        helpers.navigation.breadcrumbsShouldContain(folderName);
        helpers.fileList.shouldHaveItemCount(1);
        helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
        helpers.fileList.clickItem(folderName);
        helpers.fileList.clickItemAction('Share');
        helpers.modal.clickModalButton('Remove link');
        helpers.prompt.clickPromptButton('Remove link');
      });
    });
  });

  context.only(viewports.mobile.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
    });

    it('should create a share link for a file', () => {
      const filename = archives.fileToShare;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItemActionMobile(filename, 'Share');
      helpers.modal.clickModalButton('Get share link');
      helpers.sharing.getShareLink((shareLink) => {
        helpers.modal.clickModalButton('Done');
        helpers.auth.logOutMobile();
        cy.visit(shareLink);
        helpers.sharing.checkShareAccount(accounts.testAccount.name);
        helpers.sharing.checkShareArchive(archives.mainArchive);
        helpers.sharing.checkShareTitle(filename);
        helpers.navigation.breadcrumbsShouldContain(filename);
        helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
        helpers.fileList.clickItemActionMobile(filename, 'Share');
        helpers.modal.clickModalButton('Remove link');
        helpers.prompt.clickPromptButton('Remove link');
      });
    });
  })
});