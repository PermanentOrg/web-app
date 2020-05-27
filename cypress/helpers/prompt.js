export function typeIntoPromptField(fieldId, value) {
  cy.get('.prompt').should('be.visible');
  cy.get(fieldId).type(value);
}

export function clickPromptButton(buttonText) {
  cy.get('.prompt-field-buttons').contains(buttonText).click();
}