/* @format */
import { Component, HostBinding } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import {
  AuthResponse,
  ArchiveResponse,
  AccountResponse,
} from '@shared/services/api/index.repo';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';

@Component({
  selector: 'pr-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss'],
  standalone: false,
})
export class MfaComponent {
  @HostBinding('class.pr-auth-form') classBinding = true;
  mfaForm: UntypedFormGroup;
  waiting: boolean;

  constructor(
    fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
    private device: DeviceService,
  ) {
    this.mfaForm = fb.group({
      token: ['', [Validators.required]],
    });
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    const keepLoggedIn = this.keepLoggedIn();

    this.accountService
      .verifyMfa(formValue.token, keepLoggedIn)
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((response: ArchiveResponse) => {
        this.waiting = false;

        if (!response.getResultsData().length) {
          this.router.navigate(['/app/onboarding'], {
            queryParamsHandling: 'preserve',
          });
        } else if (this.accountService.hasRedirect()) {
          this.accountService.goToRedirect();
        } else if (this.route.snapshot.queryParams.cta === 'timeline') {
          if (this.device.isMobile() || !this.device.didOptOut()) {
            this.router.navigate(['/public'], {
              queryParams: { cta: 'timeline' },
            });
          } else {
            window.location.assign(`/app/public?cta=timeline`);
          }
        } else {
          this.message.showMessage({
            message: `Logged in as ${
              this.accountService.getAccount().primaryEmail
            }.`,
            style: 'success',
          });
          this.router.navigate(['/']);
        }
      })
      .catch((response: AuthResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError({
          message: response.getMessage(),
          translate: true,
        });
      });
  }

  private keepLoggedIn() {
    return this.route.snapshot.queryParams.keepLoggedIn === 'true';
  }
}
