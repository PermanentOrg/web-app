import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';

interface Method {
  methodId: string;
  method: string;
  value: string;
}
@Component({
  selector: 'pr-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.scss',
})
export class TwoFactorAuthComponent implements OnInit {
  turnOn: boolean = false;
  method: string = '';
  form: UntypedFormGroup;
  methods: Method[] = [];
  selectedMethodToDelete: Method;
  codeSent = false;
  loading = false;

  methodsDictionary = {
    sms: 'SMS Text',
    email: 'Email',
  };

  constructor(
    private fb: UntypedFormBuilder,
    private api: ApiService,
  ) {
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

  async ngOnInit() {
    this.loading = true;
    this.methods = await this.api.idpuser.getTwoFactorMethods();
    this.loading = false;
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

  async removeMethod(method: Method) {
    try {
      this.selectedMethodToDelete = method;
      this.method = this.selectedMethodToDelete.method;
      this.updateContactInfoValidators();
      this.form.patchValue({ contactInfo: this.selectedMethodToDelete.value });

      this.form.patchValue({ code: '' });
    } catch (error) {}
  }

  submitData(value) {
    if (this.selectedMethodToDelete) {
      this.submitRemoveMethod();
    } else {
      this.submitCreateMethod(value);
    }
    this.form.patchValue({ code: '', contactInfo: '' });
  }

  async sendCode(e) {
    e.preventDefault();

    try {
      if (this.selectedMethodToDelete) {
        await this.api.idpuser.sendDisableCode(
          this.selectedMethodToDelete.methodId,
        );
      } else {
        this.api.idpuser.sendEnableCode(
          this.method,
          this.form.get('contactInfo').value,
        );
      }
    } catch (error) {
    } finally {
      this.codeSent = true;
    }
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

  async submitRemoveMethod() {
    try {
      this.loading = true;
      await this.api.idpuser.disableTwoFactor(
        this.selectedMethodToDelete.methodId,
        this.form.get('code').value,
      );
    } catch (error) {
    } finally {
      this.methods = this.methods.filter(
        (m) => m.methodId !== this.selectedMethodToDelete.methodId,
      );
      this.selectedMethodToDelete = null;
      this.codeSent = false;
      this.method = null;
      this.loading = false;
    }
  }

  async submitCreateMethod(value) {
    try {
      this.loading = true;
      await this.api.idpuser.enableTwoFactor(
        this.method,
        this.form.get('contactInfo').value,
        this.form.get('code').value,
      );
    } catch (error) {
    } finally {
      const methods = await this.api.idpuser.getTwoFactorMethods();
      this.methods = methods;
      this.method = null;
      this.turnOn = false;
      this.codeSent = false;
      this.loading = false;
    }
  }
}
