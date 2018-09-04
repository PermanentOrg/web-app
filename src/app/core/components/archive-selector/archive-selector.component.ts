import { Component, OnInit } from '@angular/core';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { ArchiveVO } from '@root/app/models';

@Component({
  selector: 'pr-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss']
})
export class ArchiveSelectorComponent implements OnInit {
  public currentArchive: ArchiveVO;

  constructor(
    private accountService: AccountService
  ) {
    this.currentArchive = accountService.getArchive();
  }

  ngOnInit() {
  }

}
