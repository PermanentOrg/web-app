/* @format */
<<<<<<< HEAD
import { Component, HostBinding, OnInit } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> 493c643c (PER-8964-users-stay-logged-in)
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
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
<<<<<<< HEAD
=======
  host: { class: 'pr-auth-form' },
>>>>>>> 493c643c (PER-8964-users-stay-logged-in)
})
export class MfaComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  mfaForm: UntypedFormGroup;
  waiting: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
    private device: DeviceService
  ) {
    this.mfaForm = fb.group({
      token: [],
    });
  }

  ngOnInit() {}

  onSubmit(formValue: any) {
    this.waiting = true;

<<<<<<< HEAD
    this.accountService
      .verifyMfa(formValue.token)
=======
    const keepLoggedIn = this.keepLoggedIn();

    this.accountService
      .verifyMfa(formValue.token, keepLoggedIn)
>>>>>>> 493c643c (PER-8964-users-stay-logged-in)
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((response: ArchiveResponse) => {
        this.waiting = false;

        if (this.accountService.hasRedirect()) {
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
          this.message.showMessage(
            `Logged in as ${this.accountService.getAccount().primaryEmail}.`,
            'success'
          );
<<<<<<< HEAD
          this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
=======
          this.router.navigate(['/']);
>>>>>>> 493c643c (PER-8964-users-stay-logged-in)
        }
      })
      .catch((response: AuthResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }
<<<<<<< HEAD
=======

  private keepLoggedIn() {
    return this.route.snapshot.queryParams.keepLoggedIn === 'true';
  }
>>>>>>> 493c643c (PER-8964-users-stay-logged-in)
}
