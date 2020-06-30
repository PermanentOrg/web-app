import * as fileList from './fileList';
import * as prompt from './prompt';

export function shareExists(shareName, accessLevel) {
  if (!accessLevel) {
    cy.contains('.file-list-item', shareName).should('exist');
  } else {
    cy.contains('.file-list-item', shareName).should('contain', accessLevel);
  }
}

export function createAndShareFolder(folderName, shareArchiveName, accessRole) {
  fileList.createFolder(folderName);
  fileList.clickItem(folderName);
  fileList.clickItemAction('Share');
  cy.get('pr-sharing').should('be.visible');
  cy.contains('button', 'Add').click();
  cy.get('pr-archive-picker').should('be.visible');
  cy.get('pr-archive-picker').contains('pr-archive-small', shareArchiveName).click();
  prompt.selectValueInPromptField('#accessRole', accessRole);
  prompt.clickPromptFieldButton('Share');
  cy.get('pr-sharing').contains('button', 'Done').click();
}

export function getShareLink(callback) {
  cy.get('.share-link input[readonly]')
    .invoke('val')
    .then(callback);
}

export function checkShareTitle(itemName) {
  cy.contains('.share-preview-archive', itemName).should('exist');
}

export function checkShareArchive(archiveName) {
  cy.contains('.share-preview-archive', archiveName).should('exist');
}

export function checkShareAccount(accountName) {
  cy.contains('.share-preview-archive', `Shared by ${accountName}`).should('exist');
}