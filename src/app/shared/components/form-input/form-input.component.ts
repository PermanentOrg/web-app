import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pr-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: {'class': 'input-vertical'}
})
export class FormInputComponent implements OnInit {
  @Input() fieldName: string;
  @Input() placeholder: string;
  @Input() control: FormControl;
  @Input() errors;

  @Input() id: string;
  @Input() autocomplete: string;
  @Input() autocorrect: string;
  @Input() autocapitalize: string;
  @Input() spellcheck: string;

  constructor() { }

  ngOnInit() {
  }

}
