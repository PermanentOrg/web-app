import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface FormInputSelectOption {
  text: string | number;
  value: string | number;
}

export interface FormInputConfig {
  autocorrect?: string;
  autocomplete?: string;
  autocapitalize?: string;
  spellcheck?: string;
}

@Component({
  selector: 'pr-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: {'class': 'input-vertical'}
})
export class FormInputComponent implements AfterViewInit {
  @Input() type = 'text';
  @Input() fieldName: string;
  @Input() placeholder: string;
  @Input() control: FormControl;
  @Input() errors: string;
  @Input() selectOptions: FormInputSelectOption[];

  @Input() config: FormInputConfig;

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    const inputField = this.element.nativeElement.querySelector('.form-control');
    if (this.config) {
      if (this.config.autocorrect) {
        inputField.setAttribute('autocorrect', this.config.autocorrect);
      }

      if (this.config.autocomplete) {
        inputField.setAttribute('autocomplete', this.config.autocomplete);
      }

      if (this.config.autocapitalize) {
        inputField.setAttribute('autocapitalize', this.config.autocapitalize);
      }

      if (this.config.spellcheck) {
        inputField.setAttribute('spellcheck', this.config.spellcheck);
      }
    }
  }

}
