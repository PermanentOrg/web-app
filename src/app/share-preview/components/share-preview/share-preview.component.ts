import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { ArchiveVO, AccountVO, FolderVO } from '@models';
import { throttle, find } from 'lodash';
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
import { PromptService } from '@shared/services/prompt/prompt.service';
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
export class SharePreviewComponent implements OnInit, OnDestroy {

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

  archiveConfirmed = false;
  chooseArchiveText;

  formType: FormType = this.isInvite ? FormType.Invite : FormType.Signup;
  signupForm: FormGroup;
  loginForm: FormGroup;

  shareToken: string;

  hasScrollTriggered = false;
  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  routerListener: Subscription;
  accountListener: Subscription;
  archiveListener: Subscription;

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
    this.shareToken = this.route.snapshot.params.shareToken;

    this.signupForm = fb.group({
      invitation: [this.isInvite ? this.sharePreviewVO.token : ''],
      email: [this.sharePreviewVO.email, [trimWhitespace, Validators.required, Validators.email]],
      name: [this.sharePreviewVO.fullName, Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [true],
      optIn: [true]
    });

    this.loginForm = fb.group({
      email: ['', [trimWhitespace, Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    });

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

    this.accountListener = this.accountService.archiveChange
      .subscribe(async archive => {
        this.archive = archive;
        await this.reloadSharePreviewData();
      });

    this.archiveListener = this.accountService.accountChange
      .subscribe(async account => {
        if (!account) {
          this.isLoggedIn = false;

          this.archive = this.accountService.getArchive();
          this.account = this.accountService.getAccount();

          await this.reloadSharePreviewData();
          this.archiveConfirmed = false;
        }
      });

    if (this.isLinkShare) {
      this.chooseArchiveText = 'Select archive to request access with:';
      // if (!this.hasAccess) {
      //   this.showCover = true;
      // }
    } else if (this.isRelationshipShare) {
      this.chooseArchiveText = 'Select archive with access to this content:';
    }
  }

  async ngOnInit() {
    this.checkAccess();

    if (!this.hasAccess) {
      this.sendGaEvent('previewed');
    }

    if (!this.accountService.isLoggedIn()) {
      return;
    }

    if (this.isLinkShare && this.route.snapshot.queryParams.requestAccess && !this.hasRequested) {
      try {
        await this.accountService.promptForArchiveChange(this.chooseArchiveText);
        this.archiveConfirmed = true;
        await this.reloadSharePreviewData();
        this.onRequestAccessClick();
      } catch (err) {
      }
    } else if (this.isRelationshipShare && !this.hasAccess && !this.route.snapshot.queryParams.targetArchiveNbr) {
      try {
        await this.accountService.promptForArchiveChange(this.chooseArchiveText);
        this.archiveConfirmed = true;
      } catch (err) {}
    }
  }

  ngOnDestroy(): void {
    this.routerListener.unsubscribe();
    this.accountListener.unsubscribe();
    this.archiveListener.unsubscribe();
  }

  checkAccess() {
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.archive = this.accountService.getArchive();
    this.account = this.accountService.getAccount();
    this.shareArchive = this.sharePreviewVO.ArchiveVO;
    this.shareAccount = this.sharePreviewVO.AccountVO;

    if (this.isInvite) {
      this.hasAccess = this.sharePreviewVO.status.includes('accepted');
    }

    if (this.isLinkShare) {
      this.hasRequested = !!this.sharePreviewVO.ShareVO;
      this.hasAccess = this.hasRequested && this.sharePreviewVO.ShareVO.status.includes('ok');
    }

    if (this.isInvite || this.isLinkShare) {
      this.canEdit = this.hasAccess && !this.sharePreviewVO.ShareVO.accessRole.includes('viewer');
      this.canShare = this.hasAccess && this.sharePreviewVO.ShareVO.accessRole.includes('owner');
    }

    if (this.isRelationshipShare) {
      if (this.isLoggedIn) {
        this.hasAccess = this.sharePreviewVO.archiveId === this.archive.archiveId;
        this.canEdit = this.hasAccess && !this.sharePreviewVO.accessRole.includes('viewer');
        this.canShare = this.hasAccess && this.sharePreviewVO.accessRole.includes('owner');
      }

      this.formType = 2;
    }

    if (this.archive) {
      this.isOriginalOwner = this.route.snapshot.data.currentFolder.archiveId === this.archive.archiveId;
    } else {
      this.isOriginalOwner = false;
    }

    if (this.isOriginalOwner) {
      this.hasAccess = true;
      this.canEdit = true;
      this.canShare = true;
    }

    if (this.hasAccess) {
      if ( !this.route.snapshot.firstChild.data.sharePreviewView) {
        // in preview, but they have access, send to full view
        this.router.navigate(['view'], { relativeTo: this.route });
      }
      this.sendGaEvent('viewed');
    } else if (!this.hasAccess && this.route.snapshot.firstChild.data.sharePreviewView) {
      // inside full view, send back to preview
      this.router.navigate(['.'], { relativeTo: this.route.parent });
      this.showCover = false;
    }
  }

  reloadSharePreviewData() {
    if (this.isLinkShare) {
      return this.api.share.checkShareLink(this.route.snapshot.params.shareToken)
      .then((linkResponse: ShareResponse): any => {
        if (linkResponse.isSuccessful) {
          this.sharePreviewVO = linkResponse.getShareByUrlVO();
          this.checkAccess();
        }
      });
    } else if (this.isRelationshipShare) {
      const params = this.route.snapshot.params;
      return this.api.share.getShareForPreview(params.shareId, params.folder_linkId)
        .then((shareResponse: ShareResponse) => {
          this.sharePreviewVO = shareResponse.getShareVO();
          this.checkAccess();
        });
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
      if (this.device.isMobile() || !this.device.didOptOut()) {
        return this.router.navigate(['/shares', 'withme']);
      } else {
        window.location.assign(`/app/shares/`);
      }
    } else {
      const folder: FolderVO = this.sharePreviewVO.FolderVO;
      if (this.device.isMobile() || !this.device.didOptOut()) {
        return this.router.navigate(['/shares', 'withme', folder.archiveNbr, folder.folder_linkId]);
      } else {
        window.location.assign(`/app/shares/${folder.archiveNbr}/${folder.folder_linkId}`);
      }
    }
  }

  onShareShareClick() {
    this.sendGaEvent('reshare');
    if (!this.isLinkShare && (this.isOriginalOwner || this.canShare)) {
      const archiveNbr = this.sharePreviewVO.RecordVO ? this.sharePreviewVO.RecordVO.archiveNbr : this.sharePreviewVO.FolderVO.archiveNbr;
      if (this.device.isMobile() || !this.device.didOptOut()) {
        return this.router.navigate(['/shares'], { queryParams: { shareArchiveNbr: archiveNbr }});
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
    return this.router.navigate(['/app', 'myfiles']);
  }

  async onArchiveThumbClick() {
    try {
      await this.accountService.promptForArchiveChange();
      this.archiveConfirmed = true;
    } catch (err) {}
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
      if (!this.archiveConfirmed) {
        await this.accountService.promptForArchiveChange(this.chooseArchiveText);
        this.archiveConfirmed = true;
      }
      const response = await this.api.share.requestShareAccess(this.shareToken);
      const shareVo = response.getShareVO();
      if (shareVo.status === 'status.generic.pending') {
        this.message.showMessage(`Access requested. ${this.shareAccount.fullName} must approve your request.` , 'success');
        this.showCover = false;
        this.hasRequested = true;
      } else {
        this.message.showMessage('Access granted.', 'success');
        this.router.navigate(['/app', 'shares']);
      }
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
      .then(async (response: AuthResponse) => {
        if (response.needsMFA()) {
          // send to mfa verification
          const queryParams = {};
          if (this.isLinkShare) {
            this.accountService.setRedirect(['/share', this.shareToken], { queryParams: { requestAccess: true }});
          } else if (this.isRelationshipShare) {
            this.accountService.setRedirect(
              ['/share', 'view' , this.sharePreviewVO.shareId, this.sharePreviewVO.folder_linkId, 'view'],
              { queryParamsHandling: 'preserve' }
            );
          } else {
            this.accountService.setRedirect(['/share', 'invite' , this.sharePreviewVO.token, 'view']);
          }

          this.router.navigate(['/auth', 'mfa'], { queryParamsHandling: 'preserve' })
            .then(() => {
              this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
            });
        } else {
          // hide cover
          this.isLoggedIn = true;
          this.showCover = false;
          this.loginForm.reset();


          // attempt to auto switch archives if link is tagged
          if (this.route.snapshot.queryParams.targetArchiveNbr) {
            await this.accountService.refreshArchives();
            const targetArchiveNbr = this.route.snapshot.queryParams.targetArchiveNbr;
            const targetArchive = find(this.accountService.getArchives(), {archiveNbr: targetArchiveNbr}) as ArchiveVO;
            if (targetArchive) {
              try {
                await this.accountService.changeArchive(targetArchive);
                this.archiveConfirmed = true;
              } catch (err) {}
            }
          }

          // confirm archive with selector if autoswitch doesn't work
          if (!this.archiveConfirmed) {
            try {
              await this.accountService.promptForArchiveChange();
            } catch (err) {}
          }

          this.archiveConfirmed = true;

          // refresh data just in case they have access;
          await this.reloadSharePreviewData();

          this.waiting = false;

          // hit that request access if they haven't got it
          if (this.isLinkShare && !this.hasAccess && !this.hasRequested) {
            this.onRequestAccessClick();
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
