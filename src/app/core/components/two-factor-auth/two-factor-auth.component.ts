import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

interface Method {
  id: string;
  method: string;
  value: string;
}
@Component({
  selector: 'pr-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.scss',
})
export class TwoFactorAuthComponent {
  turnOn: boolean = false;
  method: string = '';
  form: UntypedFormGroup;
  methods: Method[] = [];
  selectedMethodToDelete: Method;
  codeSent = false;

  methodsDictionary = {
    sms: 'SMS Text',
    email: 'Email',
  };

  constructor(private fb: UntypedFormBuilder) {
    this.methods = [
      {
        id: 'email',
        method: 'email',
        value: 'email@example.com',
      },
    ];
    this.form = fb.group({
      code: ['', Validators.required],
      contactInfo: ['', Validators.required],
    });

    this.form.get('contactInfo').valueChanges.subscribe((value) => {
      if (this.method === 'sms') {
        this.formatPhoneNumber(value);
      }
    });
  }

  formatPhoneNumber(value: string) {
    let numbers = value.replace(/\D/g, '');
    let char = { 0: '(', 3: ')  ', 6: ' - ' };
    let formatted = '';
    for (let i = 0; i < numbers.length; i++) {
      formatted += (char[i] || '') + numbers[i];
    }
    this.form.get('contactInfo').setValue(formatted, { emitEvent: false });
  }

  removeMethod(method: Method): void {
    this.selectedMethodToDelete = method;
    this.method = this.selectedMethodToDelete.method;
    this.updateContactInfoValidators();
    this.form.patchValue({ contactInfo: this.selectedMethodToDelete.value });

    this.form.patchValue({ code: '' });
  }

  submitData(value) {
    if (this.selectedMethodToDelete) {
      // This is just for testing for the ui until the api is done
      this.submitRemoveMethod();
    } else {
      // This is just for testing for the ui until the api is done
      this.submitCreateMethod(value);
    }
    this.form.patchValue({ code: '', contactInfo: '' });
  }

  sendCode(e) {
    e.preventDefault();
    this.codeSent = true;
  }

  cancel() {
    this.selectedMethodToDelete = null;
    this.method = '';
    this.form.patchValue({ contactInfo: '', code: '' });
    this.turnOn = false;
  }

  updateContactInfoValidators() {
    const contactInfoControl = this.form.get('contactInfo');
    contactInfoControl.clearValidators();

    if (this.method === 'email') {
      contactInfoControl.setValidators([Validators.required, Validators.email]);
    } else if (this.method === 'sms') {
      contactInfoControl.setValidators([
        Validators.required,
        Validators.maxLength(17),
        Validators.minLength(17),
      ]);
    }
    contactInfoControl.updateValueAndValidity();
  }

  hasMethod(method: string): boolean {
    return this.methods.some((m) => m.method === method);
  }

  submitRemoveMethod() {
    try {
      // api call here
      this.methods = this.methods.filter(
        (m) => m.id !== this.selectedMethodToDelete.id
      );
      this.selectedMethodToDelete = null;
    } catch (error) {}
  }

  submitCreateMethod(value) {
    try {
      this.methods.push({
        id: this.method,
        method: this.method,
        value: value.contactInfo,
      });
      this.method = null;
      this.turnOn = false;
      this.codeSent = false;
    } catch (error) {}
  }
}
