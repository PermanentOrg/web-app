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
  private form: UntypedFormGroup;
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
    ];
    this.form = fb.group({
      code: ['', Validators.required],
      contactInfo: ['', Validators.required],
    });
  }

  removeMethod(method: Method): void {
    this.selectedMethodToDelete = method;
    console.log(this.selectedMethodToDelete);
    this.method = this.selectedMethodToDelete.method;
    this.form.patchValue({ contactInfo: this.selectedMethodToDelete.value });

    // Reset the value of the 'code' control to empty string
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
}
