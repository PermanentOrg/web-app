import { Component, OnInit, OnDestroy, Input, HostBinding } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { ArchiveVO } from '@models';
import { PromptService, PromptButton } from '@shared/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { BaseResponse } from '@shared/services/api/base';
import { ApiService } from '@shared/services/api/api.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Component({
  selector: 'pr-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss']
})
export class ArchiveSelectorComponent implements OnInit, OnDestroy, HasSubscriptions {
  @HostBinding('class.visible') @Input() visible: boolean;

  archives: ArchiveVO[];
  subscriptions: Subscription[] = [];

  constructor(
    private accountService: AccountService,
    private prompt: PromptService,
    private api: ApiService,
    private prConstants: PrConstantsService
  ) {
    const currentArchive = this.accountService.getArchive();
    this.archives = this.accountService.getArchives()?.filter(archive => archive.archiveId !== currentArchive.archiveId);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  archiveClick(archive: ArchiveVO) {
    const deferred = new Deferred();

    const buttons: PromptButton[] = [
      {
        buttonName: 'switch',
        buttonText: archive.isPending() ? 'Accept and switch archive' : 'Switch archive'
      },
      {
        buttonName: 'cancel',
        buttonText: 'Cancel',
        class: 'btn-secondary'
      }
    ];

    let message = `Switch to The ${archive.fullName} Archive?`;

    if (archive.isPending()) {
      message = `You have been invited to collaborate on the ${archive.fullName} archive. Accept ${this.prConstants.translate(archive.accessRole)} access and switch?`;
    }

    this.prompt.promptButtons(buttons, message, deferred.promise)
      .then((result) => {
        if (result === 'switch') {
          let acceptIfNeeded: Promise<ArchiveResponse | any> = Promise.resolve();

          if (archive.isPending()) {
            acceptIfNeeded = this.api.archive.accept(archive);
          }

          acceptIfNeeded
            .then(() => {
              return this.accountService.changeArchive(archive);
            })
            .then(() => {
              deferred.resolve();
            })
            .catch((response: BaseResponse) => {
              deferred.resolve();
            });
        } else {
          deferred.resolve();
        }
      });
  }


}
