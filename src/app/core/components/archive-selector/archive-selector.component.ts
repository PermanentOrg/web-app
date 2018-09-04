import { Component, OnInit } from '@angular/core';
import { reject } from 'lodash';
import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { ArchiveVO } from '@root/app/models';
import { ActivatedRoute } from '@angular/router';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';

@Component({
  selector: 'pr-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss']
})
export class ArchiveSelectorComponent implements OnInit {
  public currentArchive: ArchiveVO;
  public archives: ArchiveVO[];

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private prompt: PromptService
  ) {
    this.currentArchive = accountService.getArchive();
    this.archives = reject(this.route.snapshot.data['archives'], { archiveId: this.currentArchive.archiveId }) as ArchiveVO[];
  }

  ngOnInit() {
  }

  archiveClick(archive: ArchiveVO) {

    console.log('archive clicked:', archive);
    const buttons: PromptButton[] = [
      {
        buttonName: 'cancel',
        buttonText: 'Cancel',
        class: 'btn-default'
      }
    ];
  }

}
