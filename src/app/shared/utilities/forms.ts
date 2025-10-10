import { UntypedFormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { APP_CONFIG } from '@root/app/app.config';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { FormInputComponent as FormInput } from '@root/app/component-library/components/form-input/form-input.component';
import { DeviceService } from '@shared/services/device/device.service';

export function matchControlValidator(
	controlToMatch: AbstractControl,
): ValidatorFn {
	return function validator(
		controlToValidate: AbstractControl,
	): { [key: string]: boolean } | null {
		if (
			controlToValidate.value &&
			controlToValidate.value.length &&
			controlToMatch.value !== controlToValidate.value
		) {
			return {
				mismatch: true,
			};
		}

		return null;
	};
}

export function minDateValidator(minDate: string | Date) {
	return function validator(
		controlToValidate: AbstractControl,
	): { [key: string]: boolean } | null {
		if (!(minDate instanceof Date)) {
			minDate = new Date(minDate);
		}

		const currentDate = new Date(controlToValidate.value);

		if (minDate.getTime() >= currentDate.getTime()) {
			return {
				min: true,
			};
		}

		return null;
	};
}

export const FORM_ERROR_MESSAGES = {
	email: {
		email: 'Invalid email address',
		required: 'Email required',
	},
	name: {
		required: 'Full name required',
	},
	archiveName: {
		required: 'Archive name required',
	},
	invitation: {
		required: 'Invitation code required',
	},
	password: {
		minlength: `Passwords must be ${APP_CONFIG.passwordMinLength} characters`,
		required: 'Password required',
		mismatch: 'Passwords must match',
	},
	confirm: {
		mismatch: 'Passwords must match',
		required: 'Password confirmation required',
	},
	generic: {
		required: 'This field is required',
	},
};

export function setFormErrors(form: UntypedFormGroup, errors: any) {
	if (form.valid) {
		for (const key in errors) {
			if (Object.hasOwn(errors, key)) {
				delete errors[key];
			}
		}
	}

	for (const controlName in form.controls) {
		if (form.get(controlName)) {
			const control = form.get(controlName);
			if (control.dirty && control.errors) {
				const errorName = Object.keys(control.errors).pop();
				errors[controlName] = FORM_ERROR_MESSAGES[controlName][errorName];
			} else {
				errors[controlName] = null;
			}
		}
	}
}

export function getFormInputError(formInput: FormInputComponent | FormInput) {
	const control = formInput.control;

	if (
		control.valid ||
		!(
			control.touched ||
			(formInput.config && formInput.config.validateDirty && control.dirty)
		)
	) {
		return null;
	}

	const errorName = Object.keys(control.errors).pop();
	if (FORM_ERROR_MESSAGES[formInput.fieldName]) {
		return FORM_ERROR_MESSAGES[formInput.fieldName][errorName];
	} else {
		return FORM_ERROR_MESSAGES.generic[errorName];
	}
}

export function trimWhitespace(
	control: AbstractControl,
): { [key: string]: boolean } | null {
	if (
		control &&
		control.value &&
		control.value.length &&
		(control.value[0] === ' ' ||
			control.value[control.value.length - 1] === ' ')
	) {
		control.setValue(control.value.trim());
	}
	return null;
}

export function copyFromInputElement(element: HTMLInputElement) {
	const device = new DeviceService();
	const oldContentEditable = element.contentEditable;
	const oldReadOnly = element.readOnly;

	if (device.isIos()) {
		(element as any).contentEditable = true;
		element.readOnly = false;

		const range = document.createRange();
		range.selectNodeContents(element);

		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);

		element.setSelectionRange(0, 999999999);
		element.contentEditable = oldContentEditable;
		element.readOnly = oldReadOnly;
	} else {
		element.select();
	}

	document.execCommand('copy');

	element.blur();
}
