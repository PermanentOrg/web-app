/* @format */
import { Component, HostBinding, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { trimWhitespace } from '@shared/utilities/forms';
import { APP_CONFIG } from '@root/app/app.config';
import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  loginForm: UntypedFormGroup;
  waiting: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
    private cookies: CookieService,
    private device: DeviceService,
  ) {
    this.loginForm = fb.group({
      email: [
        this.cookies.get('rememberMe'),
        [trimWhitespace, Validators.required, Validators.email],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
      ],
      rememberMe: [true],
      keepLoggedIn: [true],
    });
  }

  ngOnInit() {}

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService
      .logIn(
        formValue.email,
        formValue.password,
        formValue.rememberMe,
        formValue.keepLoggedIn
      )
      .then((response: AuthResponse) => {
        if (response.needsMFA()) {
          this.router
            .navigate(['..', 'mfa'], {
              queryParamsHandling: 'merge',
              queryParams: { keepLoggedIn: formValue.keepLoggedIn },
              relativeTo: this.route,
            })
            .then(() => {
              this.message.showMessage(
                `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                'warning'
              );
            });
        } else if (response.needsVerification()) {
          this.router
            .navigate(['..', 'verify'], {
              queryParamsHandling: 'merge',
              relativeTo: this.route,
              queryParams: { keepLoggedIn: formValue.keepLoggedIn },
            })
            .then(() => {
              this.message.showMessage(
                `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                'warning'
              );
            });
        } else if (this.route.snapshot.queryParams.shareByUrl) {
          this.router
            .navigate(['/share', this.route.snapshot.queryParams.shareByUrl])
            .then(() => {
              this.message.showMessage(
                `Logged in as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                'success'
              );
            });
        } else if (this.route.snapshot.queryParams.cta === 'timeline') {
          if (this.device.isMobile() || !this.device.didOptOut()) {
            this.router.navigate(['/public'], {
              queryParams: { cta: 'timeline' },
            });
          } else {
            window.location.assign(`/app/public?cta=timeline`);
          }
        } else {
          const archives = this.accountService
            .getArchives()
            .filter((archive) => !archive.isPending());
          if (archives.length > 0) {
            this.router
              .navigate(['/'], { queryParamsHandling: 'preserve' })
              .then(() => {
                this.message.showMessage(
                  `Logged in as ${
                    this.accountService.getAccount().primaryEmail
                  }.`,
                  'success'
                );
              });
          } else {
            this.router.navigate(['/app/onboarding']);
          }
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password.', 'danger');
          this.loginForm.patchValue({
            password: '',
          });
        } else {
          this.message.showMessage(
            'Log in failed. Please try again.',
            'danger'
          );
        }
      });
  }
}
