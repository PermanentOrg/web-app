export function desktopUploadButton() {
  return cy.contains('.nav-second-row pr-upload-button .btn', 'Upload');
}

export function newFolderButton() {
  return cy.contains('.nav-second-row button', 'New folder')
}

export function sidebarFieldByName(name) {
  return cy.contains('.sidebar-item', name);
}