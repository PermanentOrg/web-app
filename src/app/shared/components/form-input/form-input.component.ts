import {
	Component,
	OnInit,
	Input,
	ElementRef,
	AfterViewInit,
	HostBinding,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { getFormInputError } from '@shared/utilities/forms';
import { find } from 'lodash';

export interface FormInputSelectOption {
	text: string | number;
	value: string | number;
}

type AttrOnOff = 'on' | 'off';

export interface FormInputConfig {
	autocorrect?: AttrOnOff;
	autocomplete?: string;
	autocapitalize?: AttrOnOff;
	spellcheck?: AttrOnOff;
	autoselect?: boolean;
	validateDirty?: boolean;
	textAlign?: string;
	format?: string;
	readOnly?: boolean;
}

@Component({
	selector: 'pr-form-input',
	templateUrl: './form-input.component.html',
	styleUrls: ['./form-input.component.scss'],
	standalone: false,
})
export class FormInputComponent implements OnInit, AfterViewInit {
	@Input() type = 'text';
	@Input() fieldName: string;
	@Input() placeholder: string;
	@Input() control: UntypedFormControl;
	@Input() errors: string;
	@Input() selectOptions: FormInputSelectOption[];
	@Input() disabled = false;

	@HostBinding('class.right-align') rightAlign = false;
	@HostBinding('class.input-vertical') inputVertical = true;

	openStatus = false;

	@Input() config: FormInputConfig;

	constructor(private element: ElementRef) {}

	ngOnInit() {
		this.control.statusChanges.subscribe(() => {
			this.errors = getFormInputError(this);
		});

		if (this.config) {
			this.rightAlign = this.config.textAlign === 'right';

			if (this.config.format) {
				this.control.valueChanges.subscribe((value) => {
					// this.control.setValue('400', {
					//   emitEvent: false,
					// });
				});
			}
		}
	}

	isLabelHidden() {
		switch (this.type) {
			case 'number':
				return this.control.value === '';
			case 'date':
				return false;
			default:
				return !this.control.value || !this.control.value.length;
		}
	}

	ngAfterViewInit() {
		const inputField =
			this.element.nativeElement.querySelector('.form-control');

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

			if (this.config.readOnly) {
				inputField.setAttribute('readonly', true);
				inputField.setSelectionRange(0, inputField.value.length);
			}
		}
	}

	getElement() {
		return this.element;
	}

	getOptionTextFromValue(value: string) {
		return find(this.selectOptions, { value })?.text;
	}
	openSelect() {
		this.openStatus = !this.openStatus;
	}

	handleChange() {
		this.openStatus = false;
	}
}
