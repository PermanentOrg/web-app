/* @format */
import { Component, HostBinding } from '@angular/core';
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
export class LoginComponent {
  @HostBinding('class.pr-auth-form') classBinding = true;
  loginForm: UntypedFormGroup;
  waiting: boolean = false;

  rememberMe: boolean = true;

  constructor(
    fb: UntypedFormBuilder,
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
      keepLoggedIn: [true],
    });
  }

  onSubmit(formValue: {
    email: string;
    password: string;
    rememberMe: boolean;
    keepLoggedIn: boolean;
  }) {
    this.waiting = true;

    return this.accountService
      .logIn(
        formValue.email,
        formValue.password,
        this.rememberMe,
        formValue.keepLoggedIn,
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
              this.message.showMessage({
                message: `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'warning',
              });
            });
        } else if (response.needsVerification()) {
          this.router
            .navigate(['..', 'verify'], {
              queryParamsHandling: 'merge',
              relativeTo: this.route,
              queryParams: { keepLoggedIn: formValue.keepLoggedIn },
            })
            .then(() => {
              this.message.showMessage({
                message: `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'warning',
              });
            });
        } else if (this.route.snapshot.queryParams.shareByUrl) {
          this.router
            .navigate(['/share', this.route.snapshot.queryParams.shareByUrl])
            .then(() => {
              this.message.showMessage({
                message: `Logged in as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'success',
              });
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
          this.accountService.refreshArchives().then(() => {
            const archives = this.accountService
              .getArchives()
              .filter((archive) => !archive.isPending());
            if (archives.length > 0) {
              this.accountService.switchToDefaultArchive().then(() => {
                this.router
                  .navigate(['/'], { queryParamsHandling: 'preserve' })
                  .then(() => {
                    this.message.showMessage({
                      message: `Logged in as ${
                        this.accountService.getAccount().primaryEmail
                      }.`,
                      style: 'success',
                    });
                  });
              });
            } else {
              this.router.navigate(['/app/onboarding']);
            }
          });
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage({
            message: 'Incorrect email or password.',
            style: 'danger',
          });
          this.loginForm.patchValue({
            password: '',
          });
        } else {
          this.message.showMessage({
            message: 'Log in failed. Please try again.',
            style: 'danger',
          });
        }
      });
  }

  navigateToRegister() {
    this.router.navigate(['..', 'signup'], {
      relativeTo: this.route,
    });
  }
}
