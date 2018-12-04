import { FormGroup, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import APP_CONFIG from '@root/app/app.config';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

export function matchValidator(group: FormGroup) {
  const match = group.controls['password'].value === group.controls['confirm'].value;

  if (match && group.value.confirm) {
    group.controls['confirm'].setErrors(null);
    return null;
  }

  const errors = { mismatch: true };
  group.controls['confirm'].setErrors(errors);

  return errors;
}

export function matchControlValidator(controlToMatch: AbstractControl): ValidatorFn {
  return function validator(controlToValidate: AbstractControl): {[key: string]: boolean} | null {
    if (controlToValidate.value && controlToValidate.value.length && controlToMatch.value !== controlToValidate.value) {
      return {
        mismatch: true
      };
    }

    return null;
  };
}

export const FORM_ERROR_MESSAGES = {
  email: {
    email: 'Invalid email address',
    required: 'Email required'
  },
  name: {
    required: 'Full name required'
  },
  invitation: {
    required: 'Invitation code required'
  },
  password: {
    minlength: `Passwords must be ${APP_CONFIG.passwordMinLength} characters`,
    required: 'Password required',
    mismatch: 'Passwords must match'
  },
  confirm: {
    mismatch: 'Passwords must match',
    required: 'Password confirmation required'
  },
  generic: {
    required: 'This field is required'
  }
};

export function setFormErrors(form: FormGroup, errors: any) {
  if (form.valid) {
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        delete errors[key];
      }
    }
  }

  for (const controlName in form.controls) {
    if (form.get(controlName) ) {
      const control = form.get(controlName);
      if ((control.dirty) && control.errors) {
        const errorName = Object.keys(control.errors).pop();
        errors[controlName] = FORM_ERROR_MESSAGES[controlName][errorName];
      } else {
        errors[controlName] = null;
      }
    }
  }
}

export function getFormInputError(formInput: FormInputComponent) {
  const control = formInput.control;

  if (control.valid || !(control.touched || (formInput.config && formInput.config.validateDirty && control.dirty))) {
    return null;
  }

  const errorName = Object.keys(control.errors).pop();
  if (FORM_ERROR_MESSAGES[formInput.fieldName]) {
    return FORM_ERROR_MESSAGES[formInput.fieldName][errorName];
  } else {
    return FORM_ERROR_MESSAGES['generic'][errorName];
  }
}
