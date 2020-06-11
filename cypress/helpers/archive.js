import * as prompt from './prompt';

export function switchToArchive(archiveName) {
  cy.get('.hamburger-menu .menu-header-desktop .archive').click();
  cy.get('.archive-list').contains(archiveName).click();
  prompt.clickPromptButton('Switch archive');
}