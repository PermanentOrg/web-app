/// <reference types="Cypress" />

import * as helpers from '../helpers/index';
const viewports = require('../fixtures/constants.json').viewports;
const accounts = require('../fixtures/accounts.json');
const archives = require('../fixtures/archives.json');

describe('Check test archive setup', () => {
  context(viewports.desktop.name, () => {
    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
    })

    it('should have the needed proper files and folders', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.itemExists(archives.filesFolderName);
      helpers.fileList.itemExists(archives.fileToPublish);
      helpers.fileList.itemExists(archives.fileToShare);
      helpers.fileList.navigateToFolder(archives.filesFolderName);
      cy.get('pr-file-list-item').should('have.length.greaterThan', 5);
      cy.contains('pr-file-list-item', 'Image').should('exist');
      cy.visit('/m/public');
      helpers.navigation.breadcrumbsShouldContain('Public');
      helpers.fileList.shouldHaveItemCount(0);
    });

    it('should have access to the needed archives', () => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.get('.hamburger-menu .menu-header-desktop .archive').click();
      helpers.archive.hasAccessToArchive(archives.shareWithArchive, 'Owner');
      helpers.archive.hasAccessToArchive(archives.publicArchive);
    });
  })
});