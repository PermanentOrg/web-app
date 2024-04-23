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
        value: 'email',
      },
      // {
      //   id: 'sms',
      //   method: 'sms',
      //   value: '1234567890',
      // },
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
    console.log(this.selectedMethodToDelete);
    this.method = this.selectedMethodToDelete.method;
    this.updateContactInfoValidators();
    this.form.patchValue({ contactInfo: this.selectedMethodToDelete.value });

    this.form.patchValue({ code: '' });
  }

  submitData(value) {
    console.log(value);
  }

  sendCode() {
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
        Validators.maxLength(18),
        Validators.minLength(18),
      ]);
    }
    contactInfoControl.updateValueAndValidity();
  }
}
