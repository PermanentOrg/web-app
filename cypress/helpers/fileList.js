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

export function clickFirstItem() {
  cy.get('.file-list-item').first().click();
}

export function doubleClickFirstItem() {
  cy.get('.file-list-item').first().dblclick();
}

export function clickItem(itemName, clickOnly, metaKeys) {
  if (!metaKeys) {
    cy.contains('.file-list-item', itemName).click();
  } else {
    cy.get('body').type(metaKeys, {release: false}).contains('.file-list-item', itemName).click();
  }

  if (!clickOnly && !metaKeys) {
    cy.get('pr-sidebar').contains(itemName).should('exist');
  }
}
/**
 * 
 * @param {Array<string>} items 
 */
export function selectItems(items) {
  items = [...items];
  clickItem(items.shift());

  while (items.length) {
    clickItem(items.shift(), null, '{ctrl}');
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

/**
 * 
 * @param {Array<string>} items 
 */
export function deleteItems(items) {
  selectItems(items);
  clickItemAction('Delete');
  cy.get('#confirm').contains('Delete').click();
  
  for (const item of items) {
    cy.get('pr-file-list-item').contains(item).should('not.exist');
  }
}

/**
 * 
 * @typedef {'Copy'|'Move'|'Delete'|'Publish'|'Share'|'Download'|'Get link'|'Get Link'} ActionName
 */

/**
 * 
 * @param {ActionName} action 
 */
export function clickItemAction(action) {
  cy.get('.file-list-controls').contains(action).click();
}

/**
 * 
 * @param {ActionName} action 
 */
export function checkItemActionEnabled(action) {
  cy.contains('.file-list-control', action).should('not.have.class', 'disabled');
}

/**
 * 
 * @param {ActionName} action 
 */
export function checkItemActionEnabledMobile(action) {
  cy.contains('.prompt-buttons button', action).should('exist');
}

/**
 * 
 * @param {ActionName} action 
 */
export function checkItemActionDisabled(action) {
  cy.contains('.file-list-control', action).should('have.class', 'disabled');
}

/**
 * 
 * @param {ActionName} action 
 */
export function checkItemActionDisabledMobile(action) {
  cy.contains('.prompt-buttons button', action).should('not.exist');
}

export function openItemActionsMobile(item) {
  cy.contains('.file-list-item', item).within(() => {
    cy.get('.right-menu-toggler').click();
  });
  cy.get('.prompt').should('be.visible');
}

export function closeItemActionsMobile() {
  cy.get('pr-prompt > .menu-wrapper').click('top');
  cy.get('.prompt').should('not.be.visible');
}


/**
 * @param {*} item
 * @param {ActionName} action 
 */
export function clickItemActionMobile(item, action) {
  cy.contains('.file-list-item', item).within(() => {
    cy.get('.right-menu-toggler').click();
  });
  cy.get('.prompt').should('be.visible');
  cy.get('.prompt-buttons').contains(action).click();
}

/**
 * 
 * @param {ActionName} action 
 */
export function clickFirstItemActionMobile(action) {
  cy.get('.file-list-item').first().within(() => {
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
  cy.get('.file-list-scroll').should('exist');
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

export function selectAll() {
  cy.get('body').type('{ctrl}a');
}

export function checkSidebarTabEnabled(tabName) {
  cy.contains('.sidebar-tab', tabName).should('exist').and('not.have.class', 'disabled');
}

export function checkSidebarTabActive(tabName) {
  cy.contains('.sidebar-tab.active', tabName).should('exist');
}

export function checkSidebarTabDisabled(tabName) {
  cy.contains('.sidebar-tab.disabled', tabName).should('exist');
}