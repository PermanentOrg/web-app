export function typeIntoPromptField(fieldId, value) {
  cy.get('.prompt').should('be.visible');
  cy.get(fieldId).type(value);
}

export function selectValueInPromptField(fieldId, value) {
  cy.get('.prompt').should('be.visible');
  cy.get(fieldId).select(value);
}

export function clickPromptFieldButton(buttonText) {
  cy.get('.prompt-field-buttons').contains(buttonText).click();
}

export function clickPromptButton(buttonText) {
  cy.get('.prompt-buttons').contains(buttonText).click();
}