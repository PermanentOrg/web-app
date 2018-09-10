import { Component, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { reject } from 'lodash';
import { Deferred } from '@root/vendor/deferred';
import { TweenMax } from 'gsap';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveVO } from '@root/app/models';
import { BaseResponse } from '@shared/services/api/base';

import { ArchiveSmallComponent } from '@core/components/archive-small/archive-small.component';

@Component({
  selector: 'pr-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss']
})
export class ArchiveSelectorComponent implements OnInit, AfterViewInit {
  public currentArchive: ArchiveVO;
  public archives: ArchiveVO[];

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private prompt: PromptService,
    private message: MessageService,
    private router: Router
  ) {
    this.currentArchive = accountService.getArchive();
    this.archives = reject(this.route.snapshot.data['archives'], { archiveId: this.currentArchive.archiveId }) as ArchiveVO[];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
      const targetElems = document.querySelectorAll('.archive-list pr-archive-small');
      TweenMax.staggerFrom(
        targetElems,
        0.75,
        {
          opacity: 0,
          ease: 'Power4.easeOut'
        },
        0.05
      );

  }

  archiveClick(archive: ArchiveVO) {
    const deferred = new Deferred();

    const buttons: PromptButton[] = [
      {
        buttonName: 'switch',
        buttonText: 'Switch archive'
      },
      {
        buttonName: 'cancel',
        buttonText: 'Cancel',
        class: 'btn-secondary'
      }
    ];

    this.prompt.promptButtons(buttons, `Switch archive to ${archive.fullName}?`, deferred.promise)
      .then((result) => {
        if (result === 'switch') {
          this.accountService.changeArchive(archive)
            .then(() => {
              deferred.resolve();
              this.router.navigate(['/myfiles']);
            })
            .catch((response: BaseResponse) => {
              deferred.resolve();
              this.message.showError(response.getMessage(), true);
            });
        } else {
          deferred.resolve();
        }
      });

  }
}
