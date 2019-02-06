import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';
import { matchControlValidator } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse } from '@shared/services/api/index.repo';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  waiting: boolean;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService
  ) {
    const params = route.snapshot.queryParams;

    let name, email, inviteCode;

    if (params.fullName) {
      name = window.atob(params.fullName);
    }

    if (params.primaryEmail) {
      email = window.atob(params.primaryEmail);
    }

    if (params.inviteCode) {
      inviteCode = window.atob(params.inviteCode);
    }

    this.signupForm = fb.group({
      invitation: [inviteCode || ''],
      email: [email || '', [Validators.required, Validators.email]],
      name: [name || '', Validators.required],
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
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.password, formValue.confirm,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    ).then((response: AccountResponse) => {
        const account = response.getAccountVO();
        if (account.needsVerification()) {
          this.message.showMessage(`Verify to continue as ${account.primaryEmail}.`, 'warning');
          this.router.navigate(['/verify']);
        } else {
          this.accountService.logIn(formValue.email, formValue.password, true, true)
            .then(() => {
              this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
              this.router.navigate(['/']);
            });
        }
      })
      .catch((response: AccountResponse) => {
        this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }
}
