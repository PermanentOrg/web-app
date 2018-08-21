import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { EditPromptComponent } from '@core/components/edit-prompt/edit-prompt.component';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private component: EditPromptComponent;

  constructor() { }

  registerComponent(toRegister: EditPromptComponent) {
    if (this.component) {
      throw new Error('PromptService - Prompt component already registered');
    }

    this.component = toRegister;
  }

  prompt(form: FormGroup, fieldNames: any) {
    if (!this.component) {
      throw new Error('PromptService - Missing prompt component');
    }

    return this.component.prompt(form, fieldNames);
  }
}
