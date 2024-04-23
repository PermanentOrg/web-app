import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

interface Method {
  id: string;
  name: string;
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
        name: 'email',
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
  }

  submitData(value) {
    console.log(value);
  }

  sendCode() {
    this.codeSent = true;
  }
}
