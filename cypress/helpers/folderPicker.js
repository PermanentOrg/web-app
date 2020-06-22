/// <reference types="Cypress" />

import * as elements from './elements';

export function clickFolderPickerItem(itemName) {
  cy.contains('.picker-row', itemName).click().should('not.exist');
}

export function confirmPickerOperation() {
  cy.get('.folder-picker .picker-footer .btn-primary').click();
}

export function cancelPickerOperation() {
  cy.get('.folder-picker .picker-footer .btn-secondary').click();
}