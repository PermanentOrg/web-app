/* @format */
import { Component, HostBinding, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '@root/app/app.config';
import { AccountVO } from '@root/app/models';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

import * as FormUtilities from '@shared/utilities/forms';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-signup',
  templateUrl: './signup-embed.component.html',
  styleUrls: ['./signup-embed.component.scss'],
})
export class SignupEmbedComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  signupForm: UntypedFormGroup;
  waiting: boolean;
  inviteCode: string;

  formErrors = {
    name: false,
    invitation: false,
    email: false,
    password: false,
    confirm: false,
  };

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams.invite) {
      this.inviteCode = queryParams.invite;
    }

    this.signupForm = fb.group({
      invitation: [this.inviteCode ? this.inviteCode : ''],
      email: ['', [trimWhitespace, Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
      ],
      agreed: [false, [Validators.requiredTrue]],
      optIn: [true],
    });

    const confirmPasswordControl = new UntypedFormControl('', [
      Validators.required,
      matchControlValidator(this.signupForm.controls['password']),
    ]);
    this.signupForm.addControl('confirm', confirmPasswordControl);
  }

  ngOnInit() {}

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService
      .signUp(
        formValue.email,
        formValue.name,
        formValue.password,
        formValue.confirm,
        formValue.agreed,
        formValue.optIn,
        null,
        formValue.invitation,
        true,
      )
      .then((account: AccountVO) => {
        if (account.needsVerification()) {
          this.router.navigate(['..', 'verify'], { relativeTo: this.route });
        } else {
          this.accountService
            .logIn(formValue.email, formValue.password, true, true)
            .then(() => {
              this.router.navigate(['..', 'done'], {
                relativeTo: this.route,
                queryParams: { inviteCode: this.inviteCode },
              });
            });
        }
      })
      .catch((err) => {
        this.message.showError({ message: err.error.message, translate: true });
        this.waiting = false;
      });
  }
}
