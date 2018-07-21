import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pr-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: {'class': 'input-vertical'}
})
export class FormInputComponent implements OnInit {
  @Input() type = 'text';
  @Input() fieldName: string;
  @Input() placeholder: string;
  @Input() control: FormControl;
  @Input() errors: string;

  @Input() config: any;

  constructor(private element: ElementRef) { }

  ngOnInit() {
    const inputField = this.element.nativeElement.querySelector('input');
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
