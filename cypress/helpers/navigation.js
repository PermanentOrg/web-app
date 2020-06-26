/// <reference types="Cypress" />

export function clickLeftMenuItem(itemName) {
  cy.contains('.hamburger-menu a', itemName).click();
}

export function clickLeftMenuItemMobile(itemName) {
  cy.get('.navbar-toggler-icon').click();
  cy.contains('.hamburger-menu a', itemName).click();
}

export function breadcrumbsShouldContain(itemName) {
  cy.get('.breadcrumbs').contains(itemName).should('exist');
}

export function breadcrumbsShouldNotContain(itemName) {
  cy.get('.breadcrumbs').contains(itemName).should('not.exist');
}

export function clickBreadcrumbItem(itemName) {
  cy.contains('.breadcrumbs .breadcrumb', itemName).click();
}