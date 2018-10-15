import { Component, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';

import { remove } from 'lodash';
import { Deferred } from '@root/vendor/deferred';
import { TweenMax } from 'gsap';

import { AccountService } from '@shared/services/account/account.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveVO } from '@root/app/models';
import { BaseResponse } from '@shared/services/api/base';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';

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
    private api: ApiService,
    private route: ActivatedRoute,
    private prompt: PromptService,
    private message: MessageService,
    private router: Router
  ) {
    this.currentArchive = accountService.getArchive();

    const archives = this.route.snapshot.data['archives'];
    const currentArchiveFetched = remove(archives, { archiveId: this.currentArchive.archiveId })[0] as ArchiveVO;

    this.currentArchive.update(currentArchiveFetched);
    this.accountService.setArchive(this.currentArchive);

    this.archives = archives as ArchiveVO[];
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

  createArchiveClick() {
    const deferred = new Deferred();

    const fields: PromptField[] = [
      {
        fieldName: 'fullName',
        placeholder: 'Archive Name',
        config: {
          autocapitalize: 'off',
          autocorrect: 'off',
          autocomplete: 'off',
          spellcheck: 'off'
        },
        validators: [Validators.required]
      },
      {
        fieldName: 'type',
        type: 'select',
        placeholder: 'Archive Type',
        validators: [Validators.required],
        selectOptions: [
          {
            text: 'Person',
            value: 'type.archive.person'
          },
          {
            text: 'Organization',
            value: 'type.archive.organization'
          }
        ]
      }
    ];

    this.prompt.prompt(fields, 'Create new archive', deferred.promise, 'Create archive')
      .then((value) => {
        return this.api.archive.create(new ArchiveVO(value));
      })
      .then((response: ArchiveResponse) => {
        const newArchive = response.getArchiveVO();
        this.archives.push(newArchive);
        this.archiveClick(newArchive);
        deferred.resolve();
      })
      .catch((response: ArchiveResponse | BaseResponse) => {
        this.message.showError(response.getMessage(), true);
        deferred.reject();
      });
  }
}
