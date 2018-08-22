import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validator, ValidationErrors } from '@angular/forms';

import { FormInputConfig } from '@shared/components/form-input/form-input.component';

import { EditPromptComponent } from '@core/components/edit-prompt/edit-prompt.component';

export interface PromptField {
  fieldName: string;
  placeholder: string;
  initialValue?: any;
  config ?: FormInputConfig;
  validators ?: ValidationErrors[];
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private component: EditPromptComponent;

  constructor(private fb: FormBuilder) { }

  registerComponent(toRegister: EditPromptComponent) {
    if (this.component) {
      throw new Error('PromptService - Prompt component already registered');
    }

    this.component = toRegister;
  }

  prompt(fields: PromptField[], savePromise?: Promise<any>, saveText?: string, cancelText?: string) {
    if (!this.component) {
      throw new Error('PromptService - Missing prompt component');
    }

    const formConfig = {};

    for (const field of fields) {
      formConfig[field.fieldName] = [field.initialValue || '', field.validators || []];
    }

    return this.component.prompt(this.fb.group(formConfig), fields, savePromise, saveText, cancelText);
  }
}


