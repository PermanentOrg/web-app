import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { FolderVO, FolderVOData, ShareByUrlVO, RecordVO, AccountVO } from '@root/app/models';
import { find } from 'lodash';
import { FolderPickerOperations } from '../folder-picker/folder-picker.component';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { Deferred } from '@root/vendor/deferred';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  public isNavigating: boolean;
  public uploadProgressVisible: boolean;

  private routerListener: Subscription;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private upload: UploadService,
    private route: ActivatedRoute,
    private prompt: PromptService,
    private api: ApiService
  ) {
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

    this.upload.progressVisible.subscribe((visible: boolean) => {
      this.uploadProgressVisible = visible;
    });
  }

  async ngOnInit() {
    const account = this.accountService.getAccount();
    if (account.emailNeedsVerification() && account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your email and phone number need verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendEmail: true,
          sendSms: true
        }
      );
    } else if (account.emailNeedsVerification()) {
      this.messageService.showMessage(
        'Your email needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendEmail: true
        }
      );
    } else if (account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your phone number needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendSms: true
        }
      );
    }
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {
    this.checkShareByUrl();
  }

  async checkShareByUrl() {
    // check for share by URL parameter to display Request Access prompt
    if (this.route.snapshot.queryParams.shareByUrl) {
      const shareUrlToken = this.route.snapshot.queryParams.shareByUrl;

      let hasRequested = false;
      let hasAccess = false;

      // hit share/checkLink endpoint to check validity and get share data
      try {
        const checkLinkResponse: ShareResponse = await this.api.share.checkShareLink(shareUrlToken);

        const shareByUrlVO = checkLinkResponse.getShareByUrlVO();
        const shareVO = shareByUrlVO.ShareVO;
        const shareItem: RecordVO | FolderVO = shareByUrlVO.FolderVO || shareByUrlVO.RecordVO;
        const shareAccount: AccountVO = shareByUrlVO.AccountVO;

        if (shareVO && shareVO.status.includes('ok')) {
          hasAccess = true;
        } else if (shareVO && shareVO.status.includes('pending')) {
          hasRequested = true;
        }

        if (!hasAccess && !hasRequested) {
          // no access and no request
          const title = `Request access to ${shareItem.displayName} shared by ${shareAccount.fullName}?`;
          try {
            const deferred = new Deferred();
            await this.prompt.confirm('Request access', title, deferred.promise);
            try {
              await this.api.share.requestShareAccess(shareUrlToken);
              deferred.resolve();
              this.messageService.showMessage('Access requested.', 'success');
            } catch (err) {
              deferred.resolve();
              if (err instanceof ShareResponse) {
                if (err.messageIncludesPhrase('share.already_exists')) {
                  this.messageService.showError(`You have already requested access to this item.`);
                } else if (err.messageIncludesPhrase('same')) {
                  this.messageService.showError(`You do not need to request access to your own item.`);
                }
              }
            }
          } finally {
            // clear query param
            this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
          }
        } else if (hasRequested) {
          // show message about having requested already
          const msg = `You have already requested access to ${shareItem.displayName}. ${shareAccount.fullName} must approve your request.`;
          this.prompt.confirm('OK', msg);
          this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
        } else if (hasAccess) {
          // redirect to share in shares, already has access
          if (shareItem.isRecord) {
            this.router.navigate(['/shares', 'withme']);
          } else if (shareItem.isFolder) {
            this.router.navigate(['/shares', 'withme', shareItem.archiveNbr, shareItem.folder_linkId]);
          }
        }
      } catch (err) {
        console.error('Error checking link', err);
        if (err instanceof ShareResponse) {
          // checkLink failed for shareByUrl;
          this.messageService.showError('Invalid share URL.');
          this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
        }
      }
    }
  }

}
