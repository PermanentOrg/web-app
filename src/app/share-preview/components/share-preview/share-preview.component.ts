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
import { matchControlValidator, trimWhitespace, copyFromInputElement } from '@shared/utilities/forms';
import { AccountResponse, AuthResponse } from '@shared/services/api/index.repo';
import { DeviceService } from '@shared/services/device/device.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { READ_ONLY_FIELD } from '@shared/components/prompt/prompt-fields';
import { PromptService } from '@core/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';

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
  isRelationshipShare = !!this.sharePreviewVO.shareId;
  isLinkShare = !this.isInvite && !this.isRelationshipShare;

  isOriginalOwner = false;
  isLoggedIn = false;
  hasRequested = this.isLinkShare && !!this.sharePreviewVO.ShareVO;
  hasAccess = false;
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
    private fb: FormBuilder,
    private prompt: PromptService,
    private ga: GoogleAnalyticsService
  ) {
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.shareToken = this.route.snapshot.params.shareToken;

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

    if (this.isInvite) {
      this.hasAccess = this.sharePreviewVO.status.includes('accepted');
      this.canEdit = this.hasAccess && !this.sharePreviewVO.ShareVO.accessRole.includes('viewer');
      this.canShare = this.hasAccess && this.sharePreviewVO.ShareVO.accessRole.includes('owner');
    }

    if (this.isLinkShare) {
      this.hasAccess = this.hasRequested && this.sharePreviewVO.ShareVO.status.includes('ok');
    }

    if (this.isRelationshipShare && this.isLoggedIn) {
      this.hasAccess = this.sharePreviewVO.archiveId === this.archive.archiveId;
      this.canEdit = this.hasAccess && !this.sharePreviewVO.accessRole.includes('viewer');
    }

    if (this.isRelationshipShare) {
      this.formType = 2;
    }

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
      this.sendGaEvent('viewed');
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
    if (this.isLinkShare && this.route.snapshot.queryParams.requestAccess && !this.hasRequested) {
      this.onRequestAccessClick();
    }

    if (!this.hasAccess) {
      this.sendGaEvent('previewed');
    }
  }

  sendGaEvent(eventAction: 'previewed' | 'viewed' | 'signup' | 'reshare') {
    let eventCategory: any;

    const queryParams = this.route.snapshot.queryParams;

    if (this.isInvite) {
      eventCategory = EVENTS.SHARE.ShareByInvite;
    } else if (this.isLinkShare) {
      eventCategory = EVENTS.SHARE.ShareByUrl;
    } else if (this.isRelationshipShare && queryParams.norel) {
      eventCategory = EVENTS.SHARE.ShareByAccountNoRel;
    } else {
      eventCategory = EVENTS.SHARE.ShareByRelationship;
    }

    this.ga.sendEvent(eventCategory[eventAction].params);
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
    this.sendGaEvent('reshare');
    if (this.isOriginalOwner) {
      const archiveNbr = this.sharePreviewVO.RecordVO ? this.sharePreviewVO.RecordVO.archiveNbr : this.sharePreviewVO.FolderVO.archiveNbr;
      if (this.device.isMobile()) {
        return this.router.navigate(['/shares', 'byme'], { queryParams: { shareArchiveNbr: archiveNbr }});
      } else {
        window.location.assign(`/app/shares?shareArchiveNbr=${archiveNbr}`);
      }
    } else if (this.isLinkShare) {
      const fields = [
        READ_ONLY_FIELD('shareUrl', 'Share link', this.sharePreviewVO.shareUrl)
      ];

      const deferred = new Deferred();

      this.prompt.prompt(fields, 'Copy share link to share', deferred.promise, 'Copy link')
      .then(() => {
        const input = this.prompt.getInput('shareUrl');
        copyFromInputElement(input);
        deferred.resolve();
      })
      .catch(() => {});
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

  onSignupSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.password, formValue.password,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    )
      .then((response: AccountResponse) => {
        this.sendGaEvent('signup');
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
          this.sendGaEvent('viewed');
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
          const queryParams = {};
          if (this.isLinkShare) {
            this.accountService.setRedirect(['/share', this.shareToken], { queryParams: { requestAccess: true }});
          } else if (this.isRelationshipShare) {
            this.accountService.setRedirect(['/share', 'view' , this.sharePreviewVO.shareId, this.sharePreviewVO.folder_linkId, 'view']);
          } else {
            this.accountService.setRedirect(['/share', 'invite' , this.sharePreviewVO.token, 'view']);
          }

          this.router.navigate(['/auth', 'mfa'])
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
          } else if (this.isLinkShare) {
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
                    this.sendGaEvent('viewed');
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
