/// <reference types="Cypress" />

import * as elements from './elements';

export function createFolder(folderName) {
  elements.newFolderButton().click();
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-title').should('contain.text', 'Create new folder');

  cy.get('#folderName').type(folderName);
  cy.get('.prompt-field-buttons > .btn').contains('Create folder').click();
  cy.contains('.file-list-item', folderName, {timeout: 10000}).should('exist');
}

export function createFolderMobile(folderName) {
  cy.get('.nav-mobile > .right-menu-toggler').click();
  cy.get('pr-right-menu').contains('Create new folder').click();
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-title').should('contain.text', 'Create new folder');
  cy.get('#folderName').type(folderName);
  cy.get('.prompt-field-buttons').contains('Create folder').click();
  cy.contains('.file-list-item', folderName, {timeout: 10000}).should('exist');
}

export function clickItem(itemName, clickOnly) {
  cy.contains('.file-list-item', itemName).click();
  if (!clickOnly) {
    cy.get('pr-sidebar').contains(itemName).should('exist');
  }
}

export function itemSelectedInSidebar(itemName) {
  cy.get('pr-sidebar').contains(itemName).should('exist');
}

export function doubleClickItem(itemName) {
  cy.contains('.file-list-item', itemName).dblclick();
}

export function navigateToFolder(folderName) {
  doubleClickItem(folderName);
  cy.get('.breadcrumbs').contains(folderName).should('exist');
}

export function itemExists(itemName) {
  cy.contains('.file-list-item', itemName, {timeout: 10000}).should('exist');
}

export function deleteItem(item, alreadySelected) {
  if (!alreadySelected) {
    cy.contains('.file-list-item', item).click();
  }
  clickItemAction('Delete');
  cy.get('#confirm').contains('Delete').click();
  cy.get('pr-file-list-item').contains(item).should('not.exist');
}

export function clickItemAction(action) {
  cy.get('.file-list-controls').contains(action).click();
}

export function checkItemActionEnabled(action) {
  cy.contains('.file-list-control', action).should('not.have.class', 'disabled');
}

export function checkItemActionDisabled(action) {
  cy.contains('.file-list-control', action).should('have.class', 'disabled');
}

export function clickItemActionMobile(item, action) {
  cy.contains('.file-list-item', item).within(() => {
    cy.get('.right-menu-toggler').click();
  });
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-buttons').contains(action).click();
}

export function deleteItemMobile(item) {
  clickItemActionMobile(item, 'Delete');
  cy.contains('.file-list-item', item).should('not.exist');
}

export function getListItem(itemNumber) {
  return cy.get('pr-file-list-item').eq(itemNumber - 1);
}

export function shouldHaveItemCount(itemCount) {
  cy.get('pr-file-list-item').should('have.length', itemCount);
}

export function multiSelectNextItems(itemCount) {
  for (let i = 0; i < itemCount; i++) {
    cy.get('body').type('{shift}{downarrow}');
  }
}

export function shouldHaveCountSelected(itemCount) {
  cy.get('.file-list-item.selected').should('have.length', itemCount);
}