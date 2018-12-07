import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validator, ValidationErrors } from '@angular/forms';

import { FormInputConfig, FormInputSelectOption } from '@shared/components/form-input/form-input.component';

import { PromptComponent } from '@core/components/prompt/prompt.component';

export interface PromptField {
  fieldName: string;
  placeholder: string;
  initialValue?: any;
  type?: string;
  selectOptions?: FormInputSelectOption[];
  config ?: FormInputConfig;
  validators ?: ValidationErrors[];
}

export interface PromptButton {
  buttonName: string;
  buttonText: string;
  value ?: any;
  class ?: string;
}

export interface PromptConfig {
  form?: FormGroup;
  fields?: PromptField[];
  buttons?: PromptButton[];
  title: string;
  savePromise?: Promise<any>;
  saveText?: string;
  cancelText?: string;
  donePromise?: Promise<any>;
  doneResolve?: Function;
  doneReject?: Function;
}

@Injectable()
export class PromptService {
  private component: PromptComponent;

  constructor(private fb: FormBuilder) { }

  registerComponent(toRegister: PromptComponent) {
    if (this.component) {
      throw new Error('PromptService - Prompt component already registered');
    }

    this.component = toRegister;
  }

  deregisterComponent() {
    this.component = null;
  }

  prompt(fields: PromptField[], title: string, savePromise?: Promise<any>, saveText?: string, cancelText?: string) {
    if (!this.component) {
      throw new Error('PromptService - Missing prompt component');
    }

    const formConfig = {};

    for (const field of fields) {
      formConfig[field.fieldName] = [field.initialValue || '', field.validators || []];
    }

    return this.component.prompt(this.fb.group(formConfig), fields, title, savePromise, saveText, cancelText);
  }

  promptButtons(buttons: PromptButton[], title: string, savePromise?: Promise<any>) {
    if (!this.component) {
      throw new Error('PromptService - Missing prompt component');
    }

    return this.component.promptButtons(buttons, title, savePromise);
  }

  confirm(confirmText: string, title: string, savePromise?: Promise<any>, confirmButtonClass?: string) {
    const confirmButtons: PromptButton[] = [
      {
        buttonName: 'confirm',
        buttonText: confirmText || 'OK'
      },
      {
        buttonName: 'cancel',
        buttonText: 'Cancel',
        class: 'btn-secondary'
      }
    ];

    if (confirmButtonClass) {
      confirmButtons[0].class = confirmButtonClass;
    }

    return this.promptButtons(confirmButtons, title, savePromise)
      .then((value: string) => {
        if (value === 'confirm') {
          return Promise.resolve(true);
        } else {
          return Promise.reject(false);
        }
      });
  }
}


