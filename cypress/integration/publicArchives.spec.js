/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

const filesFolderName = archives.filesFolderName;

describe('Publish and Public Archives', () => {
  context.skip(viewports.desktop.name, () => {
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

    it('should publish a record so it is publically viewable', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('View on web');
      cy.url().should('contain', '/p/archive').and('contain', 'record');
      helpers.fileViewer.shouldBeVisible();

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Delete');
      helpers.prompt.clickPromptButton('Delete');
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
      helpers.fileList.clickItem(filesFolderName);
      helpers.fileList.clickItemAction('Delete');
      helpers.prompt.clickPromptButton('Delete');
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should load the public root of a public archive', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Copy link');

      helpers.archive.checkArchivePublic(Cypress.config('testArchiveNbr'));

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Delete');
      helpers.prompt.clickPromptButton('Delete');
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should have the public link for a an existing public file', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('Done');

      helpers.navigation.clickLeftMenuItem('Public');
      cy.url().should('contain', 'public');
      helpers.fileList.clickFirstItem();
      helpers.fileList.clickItemAction('Publish');
      helpers.modal.clickModalButton('View on web');

      cy.url().should('contain', '/p/archive').and('not.contain', 'error');

      // cleanup published record
      cy.visit('/m/public');
      cy.url().should('contain', 'public');
      helpers.fileList.clickFirstItem();
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
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.navigateToFolder(filesFolderName);
      helpers.fileList.clickFirstItemActionMobile('Publish');
      helpers.modal.clickModalButton('Publish');
      helpers.modal.clickModalButton('View on web');
      cy.url().should('contain', '/p/archive').and('contain', 'record');
      helpers.fileViewer.shouldBeVisible();

      // cleanup published record
      cy.visit('/m/public');
      helpers.fileList.clickFirstItemActionMobile('Delete');
      helpers.prompt.clickPromptButton('Delete');
      helpers.fileList.shouldHaveItemCount(0);
    });
  })
});