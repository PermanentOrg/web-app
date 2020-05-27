/// <reference types="Cypress" />

import * as helpers from '../../helpers/index';
const viewports = require('../../fixtures/constants.json').viewports;
const accounts = require('../../fixtures/accounts.json');
const archives = require('../../fixtures/archives.json');

let itemsCreated = [];

describe.only('Relationship sharing', () => {
  context(viewports.desktop.name, () => {
    before(() => {
      itemsCreated = [];
    })

    beforeEach(() => {
      cy.viewport(...viewports.desktop.params);
      window.localStorage.setItem('debug', 'service:*,component*');
    });

    it('should share a folder with another archive as viewer', () => {
      const folderName = `sharing${Date.now()}`;
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      helpers.fileList.createFolder(folderName);
      helpers.fileList.clickItem(folderName);
      helpers.fileList.clickItemAction('Share');
      cy.contains('pr-sharing button', 'Add').click({force: true});
      cy.get('pr-archive-picker').should('be.visible');
      cy.get('pr-archive-small').contains(archives.shareWithArchive).click();
    });
  })
});