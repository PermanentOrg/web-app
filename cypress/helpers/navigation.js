/// <reference types="Cypress" />

export function clickLeftMenuItem(itemName) {
  cy.contains('.hamburger-menu a', itemName).click();
}

export function breadcrumbsShouldContain(itemName) {
  cy.get('.breadcrumbs').contains(itemName).should('exist');
}

export function clickBreadcrumbItem(itemName) {
  cy.contains('.breadcrumbs .breadcrumb', itemName).click();
}