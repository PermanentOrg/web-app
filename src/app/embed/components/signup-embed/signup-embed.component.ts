import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';
import { matchControlValidator } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse } from '@shared/services/api/index.repo';

import * as FormUtilities from '@shared/utilities/forms';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-signup',
  templateUrl: './signup-embed.component.html',
  styleUrls: ['./signup-embed.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class SignupEmbedComponent implements OnInit {
  signupForm: FormGroup;
  waiting: boolean;
  inviteCode: string;

  formErrors = {
    name: false,
    invitation: false,
    email: false,
    password: false,
    confirm: false
  };

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams.invite) {
      this.inviteCode = queryParams.invite;
    }

    this.signupForm = fb.group({
      invitation: [this.inviteCode ? this.inviteCode : '', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [false, [Validators.requiredTrue]],
      optIn: [true]
    });

    const confirmPasswordControl = new FormControl('',
    [
      Validators.required,
      matchControlValidator(this.signupForm.controls['password'])
    ]);
    this.signupForm.addControl('confirm', confirmPasswordControl);
  }

  ngOnInit() {
    const currentAccount = this.accountService.getAccount();
    if (currentAccount && currentAccount.primaryEmail) {
      this.router.navigate(['/embed', 'done'], {queryParams: { existing: true, inviteCode: this.inviteCode }});
    }
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.passwords.password, formValue.passwords.confirm,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    ).then((response: AccountResponse) => {
        const account = response.getAccountVO();
        if (account.needsVerification()) {
          this.router.navigate(['/embed', 'verify']);
        } else {
          this.accountService.logIn(formValue.email, formValue.passwords.password, true, true)
          .then(() => {
            this.router.navigate(['/embed', 'done'], {queryParams: { inviteCode: this.inviteCode }});
          });
        }
      })
      .catch((response: AccountResponse) => {
        this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

}
