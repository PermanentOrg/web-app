import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';
import { AccountVO } from '@root/app/models';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class VerifyComponent implements OnInit {
  verifyForm: FormGroup;
  formTitle = 'Verify Email';
  waiting: boolean;

  verifyingEmail = true;
  verifyingPhone = false;

  needsEmail: boolean;
  needsPhone: boolean;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private route: ActivatedRoute
  ) {

    const account = this.accountService.getAccount();

    if (!account) {
      this.router.navigate(['/auth', 'login'], { queryParamsHandling: 'preserve'});
      return;
    }

    const params = route.snapshot.params;
    // if (params.email) {
    //   const email = window.atob(params.email);
    //   if (email !== account.primaryEmail) {
    //     this.accountService.logOut();
    //     account = new AccountVO(
    //       {
    //         primaryEmail: window.atob(params.email),
    //         emailStatus: 'status.auth.unverified'
    //       }
    //     );
    //     this.accountService.setAccount(account);
    //   }
    // }

    const queryParams = route.snapshot.queryParams;

    if (queryParams) {
      if (queryParams.sendEmail) {
        this.accountService.resendEmailVerification();
      }

      if (queryParams.sendSms) {
        this.accountService.resendPhoneVerification();
      }
    }

    if (queryParams.email) {
      // decode the base64
      var decoded_email = queryParams.email.replace(/-/g, '+');
      decoded_email = decoded_email.replace(/_/g, '/');
      var query_email = atob(decoded_email);
      if (query_email !== account.primaryEmail) {
        this.message.showError(
          'Sorry, this verification code does not match your account.',
           true,
           ['/auth/', 'login']);
        this.verifyForm = fb.group({
          'token': [''],
        });
        this.waiting = true;
      } else {
        this.verifyForm = fb.group({
          'token': [queryParams.token || ''],
        });
      }
    }

    this.needsEmail = account.emailNeedsVerification();
    this.needsPhone = account.phoneNeedsVerification();

    if (!this.needsEmail && this.needsPhone) {
      this.verifyingEmail = false;
      this.verifyingPhone = true;
      this.formTitle = 'Verify Phone Number';
    } else if (!this.needsEmail) {
      this.router.navigate(['/myfiles'], { queryParamsHandling: 'preserve'});
    }

  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    let verifyPromise: Promise<AuthResponse>;

    if (this.verifyingEmail) {
      verifyPromise = this.accountService.verifyEmail(formValue.token);
    } else if (this.verifyingPhone) {
      verifyPromise = this.accountService.verifyPhone(formValue.token);
    } else {
      return;
    }

    return verifyPromise
      .then((response: AuthResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        this.waiting = false;

        const account = response.getAccountVO();
        this.accountService.setAccount(account);

        this.needsEmail = account.emailNeedsVerification();
        this.needsPhone = account.phoneNeedsVerification();

        if (this.needsPhone) {
          this.verifyForm.controls['token'].setValue('');
          this.verifyingEmail = false;
          this.verifyingPhone = true;
          this.formTitle = 'Verify Phone Number';
        } else {
          this.finish();
        }
      })
      .catch((response: AuthResponse | ArchiveResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

  resendCode() {
    this.waiting = true;

    let resendPromise: Promise<AuthResponse>;
    if (this.verifyingEmail) {
      resendPromise = this.accountService.resendEmailVerification();
    } else {
      resendPromise = this.accountService.resendPhoneVerification();
    }

    resendPromise
      .then((response: AuthResponse) => {
        this.waiting = false;
        this.message.showMessage(response.getMessage(), null, true);
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;
        let translateString = response.getMessage();
        if (translateString === 'error.auth.lookup') {
          translateString = 'warning.auth.token_does_not_match';
        }
        this.message.showError(translateString, true);
      });
  }

  finish() {
    return this.accountService.switchToDefaultArchive()
      .then((response: ArchiveResponse) => {
        this.message.showMessage(`${this.verifyingEmail ? 'Email' : 'Phone number'} verified.`, 'success');
        if (this.route.snapshot.queryParams.shareByUrl) {
          this.router.navigate(['/share', this.route.snapshot.queryParams.shareByUrl])
            .then(() => {
              this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
            });
        } else {
          this.router.navigate(['/']);
        }
      });
  }

}
