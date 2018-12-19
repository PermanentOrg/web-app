import { Component, OnInit, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getFormInputError } from '@shared/utilities/forms';

export interface FormInputSelectOption {
  text: string | number;
  value: string | number;
}

export interface FormInputConfig {
  autocorrect?: string;
  autocomplete?: string;
  autocapitalize?: string;
  spellcheck?: string;
  autoselect?: boolean;
  validateDirty?: boolean;
}

@Component({
  selector: 'pr-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: {'class': 'input-vertical'}
})
export class FormInputComponent implements OnInit, AfterViewInit {
  @Input() type = 'text';
  @Input() fieldName: string;
  @Input() placeholder: string;
  @Input() control: FormControl;
  @Input() errors: string;
  @Input() selectOptions: FormInputSelectOption[];

  @Input() config: FormInputConfig;

  constructor(private element: ElementRef) { }

  ngOnInit() {
    this.control.statusChanges.subscribe(() => {
      this.errors = getFormInputError(this);
    });
  }

  ngAfterViewInit() {
    const inputField = this.element.nativeElement.querySelector('.form-control');

    inputField.addEventListener('blur', (event) => {
      this.errors = getFormInputError(this);
    });

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

      if (this.config.autoselect && this.control.value) {
        inputField.addEventListener('focus', (event) => {
          inputField.setSelectionRange(0, inputField.value.length);
        });
      }
    }
  }



}
