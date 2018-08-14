import { FormGroup } from '@angular/forms';

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

const FORM_ERROR_MESSAGES = {
  email: {
    email: 'Invalid email address',
    required: 'Email required'
  },
  password: {
    minlength: `Passwords must be 10 characters`,
    required: 'Password required',
    mismatch: 'Passwords must match'
  },
  confirm: {
    mismatch: 'Passwords must match'
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
      if (control.touched && control.errors) {
        const errorName = Object.keys(control.errors).pop();
        errors[controlName] = FORM_ERROR_MESSAGES[controlName][errorName];
      } else {
        errors[controlName] = null;
      }
    }
  }
}
