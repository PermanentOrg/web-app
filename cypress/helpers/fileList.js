/// <reference types="Cypress" />

export function createFolder(folderName) {
  cy.get('.sidebar-align > .btn-primary').should('contain.text', 'New folder').click();
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-title').should('contain.text', 'Create new folder');

  cy.get('#folderName').type(folderName);
  cy.get('.prompt-field-buttons > .btn').contains('Create folder').click();
  cy.get('pr-file-list').contains(folderName).should('exist');
}

export function createFolderMobile(folderName) {
  cy.get('.nav-mobile > .right-menu-toggler').click();
  cy.get('pr-right-menu').contains('Create new folder').click();
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-title').should('contain.text', 'Create new folder');
  cy.get('#folderName').type(folderName);
  cy.get('.prompt-field-buttons').contains('Create folder').click();
  cy.get('pr-file-list').contains(folderName).should('exist');
}

export function clickItem(itemName, clickOnly) {
  cy.get('pr-file-list').contains(itemName).parent().click();
  if (!clickOnly) {
    cy.get('pr-sidebar').contains(itemName).should('exist');
  }
}

export function itemExists(folderName) {
  cy.get('pr-file-list').contains(folderName).should('exist');
}

export function deleteItem(item) {
  cy.get('pr-file-list').contains(item).parent().click();
  clickItemAction('Delete');
  cy.get('#confirm').contains('Delete').click();
  cy.get('pr-file-list').contains(item).should('not.exist');
}

export function clickItemAction(action) {
  cy.get('.file-list-controls').contains(action).click();
}

export function clickItemActionMobile(item, action) {
  cy.get('pr-file-list').contains(item).parent().within(() => {
    cy.get('.right-menu-toggler').click();
  });
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-buttons').contains(action).click();
}

export function deleteItemMobile(item) {
  clickItemActionMobile(item, 'Delete');
  cy.get('pr-file-list').contains(item).should('not.exist');
}