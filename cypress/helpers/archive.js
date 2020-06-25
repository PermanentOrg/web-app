import * as prompt from './prompt';

export function switchToArchive(archiveName) {
  cy.get('.hamburger-menu .menu-header-desktop .archive').click();
  cy.get('.archive-list').contains(archiveName).click();
  prompt.clickPromptButton('Switch archive');
}

export function getCurrentArchiveNbr() {
  return new Promise((resolve, reject) => {
    cy.window().then(win => {
      const archiveString = win.localStorage.getItem('archive');
      if (!archiveString) {
        return reject(false);
      }

      const archive = JSON.parse(archiveString);
      const archiveNbr = archive.archiveNbr;

      resolve(archiveNbr);
    });
  });
}

export function checkArchiveNonPublic(archiveNbr) {
  cy.visit(`/p/archive/${archiveNbr}`);
  cy.url().should('contain', 'error');
}

export function checkArchivePublic(archiveNbr) {
  cy.visit(`/p/archive/${archiveNbr}`);
  cy.url().should('not.contain', 'error').and('contain', archiveNbr);
}