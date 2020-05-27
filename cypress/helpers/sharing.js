import * as fileList from './fileList';
import * as prompt from './prompt';

export function shareExists(shareName, accessLevel) {
  if (!accessLevel) {
    cy.get('pr-file-list-item').children().should('contain', shareName);
  } else {
    cy.get('pr-file-list-item').children().should('contain', shareName).and('contain', accessLevel);
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