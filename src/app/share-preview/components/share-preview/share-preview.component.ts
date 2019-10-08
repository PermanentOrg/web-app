import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO, AccountVO } from '@models/index';
import { throttle } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';
import { AccountResponse, AuthResponse } from '@shared/services/api/index.repo';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

enum FormType {
  Signup,
  Invite,
  Login
}

@Component({
  selector: 'pr-share-preview',
  templateUrl: './share-preview.component.html',
  styleUrls: ['./share-preview.component.scss']
})
export class SharePreviewComponent implements OnInit {
  bottomBannerVisible = true;


  archive: ArchiveVO = this.route.snapshot.data.shareByUrlVO.ArchiveVO;
  account: AccountVO = this.route.snapshot.data.shareByUrlVO.AccountVO;
  displayName: string = this.route.snapshot.data.currentFolder.displayName;

  isLoggedIn = false;

  showCover = false;
  showForm = true;

  formType: FormType = 0;
  authForm: FormGroup;

  shareToken: string;

  hasScrollTriggered = false;

  waiting = false;

  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private api: ApiService,
    private message: MessageService,
    private fb: FormBuilder
  ) {
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.shareToken = this.route.snapshot.params.shareToken;

    const inviteCode = null;

    this.authForm = fb.group({
      invitation: [inviteCode ? inviteCode : ''],
      email: ['', [trimWhitespace, Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [true ],
      optIn: [true]
    });
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.showCover = true;
    //   this.hideBottomBanner();
    // }, 2000);
  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  toggleCover() {
    this.showCover = !this.showCover;
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.scrollHandlerDebounced();
  }

  scrollCoverToggle() {
    if (!this.hasScrollTriggered) {
      this.hasScrollTriggered = true;
      setTimeout(() => {
        this.showCover = true;
      }, 0);
    }
  }

  async onRequestAccessClick() {
    try {
      this.waiting = true;
      await this.api.share.requestShareAccess(this.shareToken);
      this.message.showMessage(`Access requested. ${this.account.fullName} must approve your request.` , 'success');
      this.toggleCover();
    } catch (err) {
      if (err instanceof ShareResponse) {
        if (err.messageIncludesPhrase('share.already_exists')) {
          this.message.showError(`You have already requested access to this item.`);
        } else if (err.messageIncludesPhrase('same')) {
          this.message.showError(`You do not need to request access to your own item.`);
        }
      }
    } finally {
      this.waiting = false;
    }
  }

  onSignupSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.password, formValue.password,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    )
      .then((response: AccountResponse) => {
        return this.accountService.logIn(formValue.email, formValue.password, true, true);
      })
      .then(() => {
        // check if invite, send access request if needed, or show preview mode
        // this.router.navigate(['../', 'done'], {queryParams: { inviteCode: this.inviteCode, relativeTo: this.route }});
      })
      .catch((response: AccountResponse) => {
        this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

  onLoginSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, true, true)
      .then((response: AuthResponse) => {
        if (response.needsMFA()) {
          // send to mfa verification
          this.router.navigate(['/auth', 'mfa'], { queryParamsHandling: 'preserve'})
            .then(() => {
              this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
            });
        } else {
          // all verified, send access request if needed or show public mode
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password.', 'danger');
          this.authForm.patchValue({
            password: ''
          });
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
      });
  }

  stopPropagation(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

}
