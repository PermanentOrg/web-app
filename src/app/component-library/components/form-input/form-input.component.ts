import {
	Component,
	OnInit,
	OnChanges,
	Input,
	ElementRef,
	AfterViewInit,
	HostBinding,
	Output,
	EventEmitter,
	SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, Validators, FormControl } from '@angular/forms';
import { getFormInputError } from '@shared/utilities/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

type AttrOnOff = 'on' | 'off';

type Variant = 'light' | 'dark';

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
	selector: 'pr-form-input-glam',
	templateUrl: './form-input.component.html',
	styleUrls: ['./form-input.component.scss'],
	standalone: false,
})
export class FormInputComponent implements OnInit, OnChanges, AfterViewInit {
	@Input() type = 'text';
	@Input() fieldName: string;
	@Input() placeholder: string;
	@Input() control: UntypedFormControl;
	@Input() errors: string;
	@Input() variant: Variant = 'light';
	@Input() validators: {
		validation: string;
		message: string;
		value?: number | string;
	}[] = [];
	@Input() hideLabel: boolean = false;
	@Input() iconPosition: Record<string, string> = {};
	@Input() styling: Record<string, string> = {};

	@HostBinding('class.right-align') rightAlign = false;
	@HostBinding('class.input-vertical') inputVertical = true;

	@Input() config: FormInputConfig;

	@Input() debounceTime: number = 0; // Time in milliseconds
	@Output() valueChange = new EventEmitter<string>();

	public value = '';
	private validatorsThatRequireAValue = [
		'min',
		'minLength',
		'maxLength',
		'max',
	];

	public valueChangeSubject = new Subject<string>();
	private valueChangeSubscription: Subscription;

	constructor(private element: ElementRef) {
		this.subscribeToValueChanges();
	}

	ngOnChanges(changes: SimpleChanges): void {
		// If debounceTime changes, resubscribe to apply the new debounce time
		if (changes.debounceTime) {
			this.subscribeToValueChanges();
		}
	}

	private subscribeToValueChanges() {
		if (!this.control) {
			if (this.valueChangeSubscription) {
				this.valueChangeSubscription.unsubscribe(); // Prevent memory leaks
			}

			this.valueChangeSubscription = this.valueChangeSubject
				.pipe(debounceTime(this.debounceTime))
				.subscribe((value) => {
					this.value = value;
					this.valueChange.emit(value);
					this.errors = this.getInputErrorFromValue(value);
				});
		}
	}

	onInputChange(value: string) {
		this.value = value;
		this.valueChangeSubject.next(value);
	}

	ngOnInit() {
		if (this.control) {
			this.control.statusChanges.subscribe(() => {
				this.errors = getFormInputError(this);
			});
		}
		if (this.config) {
			this.rightAlign = this.config.textAlign === 'right';
		}
	}

	isLabelHidden() {
		switch (this.type) {
			case 'number':
				if (this.control) {
					return this.control.value === '';
				}
				return this.value === '';
			case 'date':
				return false;
			default:
				if (this.control) {
					return !this.control.value || !this.control.value.length;
				}
				return !this.value;
		}
	}

	ngAfterViewInit() {
		const inputField =
			this.element.nativeElement.querySelector('.form-control');

		inputField.addEventListener('blur', (event) => {
			if (this.control) {
				this.errors = getFormInputError(this);
			} else {
				this.errors = this.getInputErrorFromValue(this.value);
			}
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

			if (this.config.autoselect && (this.control.value || this.value)) {
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

	public getInputErrorFromValue(value: string) {
		const errorMessages = [];
		for (const validator of this.validators) {
			let control = null;
			if (this.validatorsThatRequireAValue.includes(validator.validation)) {
				control = new FormControl(
					value,
					Validators[validator.validation](validator.value),
				);
			} else {
				control = new FormControl(value, Validators[validator.validation]);
			}
			if (control.invalid) {
				errorMessages.push(validator.message);
			}
		}

		return errorMessages.pop();
	}
}
