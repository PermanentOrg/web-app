import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { ArchiveVO, AccountVO, FolderVO } from '@models/index';
import { throttle } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';
import { AccountResponse, AuthResponse } from '@shared/services/api/index.repo';
import { DeviceService } from '@shared/services/device/device.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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

  // share data
  account: AccountVO = this.accountService.getAccount();
  archive: ArchiveVO = this.accountService.getArchive();
  sharePreviewVO = this.route.snapshot.data.sharePreviewVO;
  shareArchive: ArchiveVO = this.sharePreviewVO.ArchiveVO;
  shareAccount: AccountVO = this.sharePreviewVO.AccountVO;
  displayName: string = this.route.snapshot.data.currentFolder.displayName;

  // access and permissions
  isInvite = !!this.sharePreviewVO.inviteId;
  isOriginalOwner = false;
  isLoggedIn = false;
  hasRequested = !!this.sharePreviewVO.ShareVO;
  hasAccess = this.hasRequested && this.sharePreviewVO.ShareVO.status.includes('ok');
  canEdit = this.hasAccess && !this.sharePreviewVO.ShareVO.accessRole.includes('viewer');
  canShare = this.hasAccess && !this.sharePreviewVO.ShareVO.accessRole.includes('owner');

  // component toggles
  showCover = false;
  showForm = true;

  waiting = false;
  isNavigating = false;

  formType: FormType = this.isInvite ? FormType.Invite : FormType.Signup;
  signupForm: FormGroup;
  loginForm: FormGroup;

  shareToken: string;

  hasScrollTriggered = false;
  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  routerListener: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private api: ApiService,
    private message: MessageService,
    private device: DeviceService,
    private fb: FormBuilder
  ) {
    console.log(this.sharePreviewVO, this.shareArchive, this.shareAccount);
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.shareToken = this.route.snapshot.params.shareToken;

    const inviteCode = null;

    this.signupForm = fb.group({
      invitation: [this.isInvite ? this.sharePreviewVO.token : ''],
      email: [this.isInvite ? this.sharePreviewVO.email : '', [trimWhitespace, Validators.required, Validators.email]],
      name: [this.isInvite ? this.sharePreviewVO.fullName : '', Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [true],
      optIn: [true]
    });

    this.loginForm = fb.group({
      email: ['', [trimWhitespace, Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    });

    if (this.archive) {
      this.isOriginalOwner = this.route.snapshot.data.currentFolder.archiveId === this.archive.archiveId;
    }

    if (this.isOriginalOwner) {
      this.hasAccess = true;
      this.canEdit = true;
      this.canShare = true;
    }

    if (this.hasAccess && !this.router.routerState.snapshot.url.includes('view')) {
      this.router.navigate(['view'], { relativeTo: this.route });
    }

    this.routerListener = this.router.events
      .pipe(filter((event) => {
        return event instanceof NavigationStart || event instanceof NavigationEnd;
      })).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating = true;
        } else if (event instanceof NavigationEnd) {
          this.isNavigating = false;
        }
      });
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.showCover = true;
    //   this.hideBottomBanner();
    // }, 2000);

    if (this.route.snapshot.queryParams.sendRequest && !this.hasRequested) {
      this.onRequestAccessClick();
    }
  }

  toggleCover() {
    this.showCover = !this.showCover;
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.scrollHandlerDebounced();
  }

  onViewShareClick() {
    if (this.sharePreviewVO.RecordVO) {
      if (this.device.isMobile()) {
        return this.router.navigate(['/shares', 'withme']);
      } else {
        window.location.assign(`/app/shares/`);
      }
    } else {
      const folder: FolderVO = this.sharePreviewVO.FolderVO;
      if (this.device.isMobile()) {
        return this.router.navigate(['/shares', 'withme', folder.archiveNbr, folder.folder_linkId]);
      } else {
        window.location.assign(`/app/shares/${folder.archiveNbr}/${folder.folder_linkId}`);
      }
    }
  }

  onShareShareClick() {
    // needs to open share dialog;
    if (this.sharePreviewVO.RecordVO) {
      if (this.device.isMobile()) {
        return this.router.navigate(['/shares', 'withme']);
      } else {
        window.location.assign(`/app/shares/`);
      }
    } else {
      const folder: FolderVO = this.sharePreviewVO.FolderVO;
      if (this.device.isMobile()) {
        return this.router.navigate(['/shares', 'withme', folder.archiveNbr, folder.folder_linkId]);
      } else {
        window.location.assign(`/app/shares/${folder.archiveNbr}/${folder.folder_linkId}`);
      }
    }
  }

  onMyAccountClick() {
    if (this.device.isMobile()) {
      return this.router.navigate(['/myfiles']);
    } else {
      window.location.assign(`/app`);
    }
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
      this.message.showMessage(`Access requested. ${this.shareAccount.fullName} must approve your request.` , 'success');
      this.showCover = false;
      this.hasRequested = true;
    } catch (err) {
      if (err instanceof ShareResponse) {
        if (err.messageIncludesPhrase('share.already_exists')) {
          this.hasRequested = true;
          this.message.showError(`You have already requested access to this item.`);
        } else if (err.messageIncludesPhrase('same')) {
          this.message.showError(`You do not need to request access to your own item.`);
        }
      }
    } finally {
      this.waiting = false;
    }
  }

  test() {
    console.log('hello');
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
        // check if invite and show preview mode, or send access request
        this.isLoggedIn = true;

        this.archive = this.accountService.getArchive();
        this.account = this.accountService.getAccount();

        if (this.isInvite) {
          this.showCover = false;
          this.hasAccess = true;
          this.router.navigate(['view'], { relativeTo: this.route });
        } else {
          this.onRequestAccessClick();
        }
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
          this.router.navigate(['/auth', 'mfa'], { queryParams: { shareByUrl: this.shareToken }})
            .then(() => {
              this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
            });
        } else {
          // hide cover, send request access
          this.isLoggedIn = true;
          this.showCover = false;

          this.archive = this.accountService.getArchive();
          this.account = this.accountService.getAccount();

          this.isOriginalOwner = this.route.snapshot.data.currentFolder.archiveId === this.archive.archiveId;

          if (this.isOriginalOwner) {
            this.hasAccess = true;
            this.canEdit = true;
            this.canShare = true;
            this.router.navigate(['view'], { relativeTo: this.route });
          } else if (!this.isInvite) {
            this.api.share.checkShareLink(this.route.snapshot.params.shareToken)
            .then((linkResponse: ShareResponse): any => {
              if (linkResponse.isSuccessful) {
                const sharePreviewVO = linkResponse.getShareByUrlVO();
                const shareVO = sharePreviewVO.ShareVO;
                if (shareVO) {
                  this.hasRequested = true;

                  if (shareVO.status.includes('ok')) {
                    this.hasAccess = true;
                    this.router.navigate(['view'], { relativeTo: this.route });
                  }
                } else {
                  this.onRequestAccessClick();
                }
              }
            });
          } else {

          }
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password.', 'danger');
          this.loginForm.patchValue({
            password: ''
          });
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
      });
  }

  stopPropagation(evt) {
    evt.stopPropagation();
  }

}
