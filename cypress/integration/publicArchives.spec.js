/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

const filesFolderName = archives.filesFolderName;

describe('Publish and Public Archives', () => {
  context(viewports.desktop.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    });

    it('should not load a non-public archive', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.navigation.clickLeftMenuItem('Public');
      helpers.fileList.shouldHaveItemCount(0);
      helpers.auth.logOut();
      cy.clearCookies({domain: null});
      helpers.archive.checkArchiveNonPublic(Cypress.config('testArchiveNbr'));
    });

    it('should publish a file so it is publically viewable', () => {
      const filename = archives.fileToPublish;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(filename);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('View on web');
      cy.url().should('contain', '/p/archive').and('contain', 'record');
      helpers.fileViewer.shouldBeVisible();

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.deleteItem(filename);
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should publish a folder so it is publically viewable and navigable', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(filesFolderName);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('View on web');
      cy.url().should('contain', '/p/archive');
      helpers.navigation.breadcrumbsShouldContain(filesFolderName);
      helpers.navigation.breadcrumbsShouldContain('Public');
      helpers.fileList.doubleClickFirstItem();
      cy.url().should('contain', 'record');
      helpers.fileViewer.shouldBeVisible();

      // cleanup published folder
      cy.visit('/m/public');
      helpers.fileList.deleteItem(filesFolderName);
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should load the public root of a public archive', () => {
      const filename = archives.fileToPublish;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(filename);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Copy link');

      helpers.archive.checkArchivePublic(Cypress.config('testArchiveNbr'));

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.deleteItem(filename);
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should have the public link for a an existing public file', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      const filename = archives.fileToPublish;

      helpers.fileList.clickItem(filename);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      helpers.navigation.clickLeftMenuItem('Public');
      cy.url().should('contain', 'public');
      helpers.fileList.clickItem(filename);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('View on web');

      cy.url().should('contain', '/p/archive').and('not.contain', 'error');

      // cleanup published record
      cy.visit('/m/public');
      cy.url().should('contain', 'public');
      helpers.fileList.deleteItem(filename);
      helpers.fileList.shouldHaveItemCount(0);
    });


    it('should have the proper available actions in Public', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItem(archives.fileToPublish);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      helpers.fileList.clickItem(archives.filesFolderName);
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      cy.visit('/m/public');
      
      // check tabs for folder
      helpers.fileList.clickItem(archives.filesFolderName);
      helpers.fileList.checkSidebarTabDisabled('Sharing');
      helpers.fileList.checkSidebarTabEnabled('Views');

      // check tabs and actions for file
      helpers.fileList.clickItem(archives.fileToPublish);
      // helpers.fileList.checkSidebarTabDisabled('Sharing');
      helpers.fileList.checkSidebarTabDisabled('Views');
      helpers.fileList.checkItemActionEnabled('Copy');
      helpers.fileList.checkItemActionEnabled('Move');
      helpers.fileList.checkItemActionEnabled('Delete');
      helpers.fileList.checkItemActionEnabled('Publish');
      helpers.fileList.checkItemActionDisabled('Share');

      // clean up
      helpers.fileList.selectAll();
      helpers.fileList.clickItemAction('Delete');
      helpers.prompt.clickPromptButton('Delete');
      helpers.fileList.shouldHaveItemCount(0);
    });

  });

  context(viewports.mobile.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.mobile.params);
    });

    it('should publish a record so it is publically viewable', () => {
      const filename = archives.fileToPublish;

      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);

      helpers.fileList.clickItemActionMobile(filename, "Publish");
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('View on web');
      cy.url().should('contain', '/p/archive').and('contain', 'record');
      helpers.fileViewer.shouldBeVisible();

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.deleteItemMobile(filename);
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should have the proper available actions in Public', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.clickItemActionMobile(archives.filesFolderName, 'Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      helpers.fileList.clickItemActionMobile(archives.fileToPublish, 'Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      cy.visit('/m/public');


      // check actions for file
      helpers.fileList.openItemActionsMobile(archives.fileToPublish);
      helpers.fileList.checkItemActionEnabledMobile('Copy');
      helpers.fileList.checkItemActionEnabledMobile('Move');
      helpers.fileList.checkItemActionEnabledMobile('Delete');
      helpers.fileList.checkItemActionEnabledMobile('Get link');
      helpers.fileList.checkItemActionDisabledMobile('Share');
      helpers.fileList.closeItemActionsMobile();

      cy.reload();
      
      // check actions for folder
      helpers.fileList.openItemActionsMobile(archives.filesFolderName);
      helpers.fileList.checkItemActionEnabledMobile('Copy');
      helpers.fileList.checkItemActionEnabledMobile('Move');
      helpers.fileList.checkItemActionEnabledMobile('Delete');
      helpers.fileList.checkItemActionEnabledMobile('Get link');
      helpers.fileList.checkItemActionDisabledMobile('Share');
      helpers.fileList.closeItemActionsMobile();

      // clean up
      helpers.fileList.deleteItemMobile(archives.filesFolderName);
      helpers.fileList.deleteItemMobile(archives.fileToPublish);

      helpers.fileList.shouldHaveItemCount(0);
    });
  })
});