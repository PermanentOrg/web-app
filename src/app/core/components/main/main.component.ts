import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { FolderVO, FolderVOData } from '@root/app/models';
import { find } from 'lodash';
import { FolderPickerOperations } from '../folder-picker/folder-picker.component';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';

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

      const hasAccess = false;

      // hit share/checkLink endpoint to check validity and get share data
      const checkLinkResponse = await this.api.share.checkShareLink(shareUrlToken);

      console.log(checkLinkResponse);

      if (!hasAccess) {
        const title = `Request access to Item Name shared by Account Name?`;
        if (await this.prompt.confirm('Request access', title)) {
          console.log('requesting access');

          try {
            const requestResponse = await this.api.share.requestShareAccess(shareUrlToken);
            this.messageService.showMessage('Access request sent.');
          } catch (err) {
            if (err.getMessage) {
              if ((err as ShareResponse).messageIncludesPhrase('share.already_exists')) {
                this.messageService.showError(`You have already requested access to this item.`);
              }
            }
          }
          // hit api to send request
        }
      } else {
        console.log('redirecting to share, already has access');
      }
    }
  }

}
