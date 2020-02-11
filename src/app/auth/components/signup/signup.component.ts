import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse, InviteResponse } from '@shared/services/api/index.repo';
import { ApiService } from '@shared/services/api/api.service';
import { RecordVO, FolderVO, RecordVOData, FolderVOData, AccountVO } from '@models/index';
import { DeviceService } from '@shared/services/device/device.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

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

  showInviteCode = true;
  isForShareInvite = false;

  shareArchiveNbr: string;
  shareFolder_linkId: number;

  shareItem: RecordVO | FolderVO;
  shareFromName: string;
  shareItemIsRecord = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
    private device: DeviceService,
    private ga: GoogleAnalyticsService
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

    if (params.shid && params.tp) {
      this.isForShareInvite = true;
      this.showInviteCode = false;

      const responseData = this.route.snapshot.data.shareInviteData;

      if (!responseData) {
        this.isForShareInvite = false;
        this.showInviteCode = true;
      } else {
        const itemData: RecordVOData | FolderVOData = {
          archiveNbr: responseData.recArchiveNbr,
          folder_linkId: responseData.folder_linkId,
          displayName: responseData.sharedItem,
          thumbURL500: responseData.sharedThumb
        };

        this.shareFromName = responseData.ShareArcName;

        this.shareItemIsRecord = params.tp === 'r';
        this.shareItem = this.shareItemIsRecord ? new RecordVO(itemData) : new FolderVO(itemData);
      }
    }

    this.signupForm = fb.group({
      invitation: [inviteCode || ''],
      email: [email || '', [trimWhitespace, Validators.required, Validators.email]],
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

              if (this.route.snapshot.queryParams.eventCategory) {
                this.ga.sendEvent({
                  hitType: 'event',
                  eventCategory: this.route.snapshot.queryParams.eventCategory,
                  eventAction: 'signup'
                });
              }

              if (this.route.snapshot.queryParams.shareByUrl) {
                this.router.navigate(['/share', this.route.snapshot.queryParams.shareByUrl]);
              } else if (this.route.snapshot.queryParams.cta === 'timeline') {
                if (this.device.isMobile()) {
                  this.router.navigate(['/public'], { queryParams: { cta: 'timeline' }});
                } else {
                  window.location.assign(`/app/public?cta=timeline`);
                }
              } else if (!this.isForShareInvite) {
                if (this.device.isMobile()) {
                  this.router.navigate(['/']);
                } else {
                  window.location.assign('/app');
                }
              } else if (this.shareItemIsRecord) {
                setTimeout(() => {
                  this.router.navigate(['/shares', 'withme']);
                }, 500);
              } else {
                setTimeout(() => {
                  this.router.navigate(['/shares', 'withme', this.shareItem.archiveNbr, this.shareItem.folder_linkId]);
                }, 500);
              }
            });
        }
      })
      .catch((response: AccountResponse) => {
        this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }
}
