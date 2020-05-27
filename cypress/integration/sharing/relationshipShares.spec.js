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
      itemsCreated.push(folderName);
      helpers.fileList.clickItem(folderName);
      helpers.fileList.clickItemAction('Share');
      cy.get('pr-sharing').should('be.visible');
      cy.contains('button', 'Add').click();
      cy.get('pr-archive-picker').should('be.visible');
      cy.get('pr-archive-picker').contains('pr-archive-small', archives.shareWithArchive).click();
      helpers.prompt.selectValueInPromptField('#accessRole', 'access.role.viewer');
      helpers.prompt.clickPromptButton('Share');
      cy.get('pr-sharing').contains('button', 'Done').click();
      cy.get('pr-left-menu').click('pr-archive-small');
      cy.
    });

    after(() => {
      helpers.auth.logIn(accounts.testAccount.email, accounts.testAccount.password);
      cy.url().should('contain', 'myfiles');
      for (const folderName of itemsCreated) {
        helpers.fileList.deleteItem(folderName); 
      }
    });
  })
});