import { Component, OnInit, OnDestroy, Input, HostBinding } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { ArchiveVO } from '@models';

@Component({
  selector: 'pr-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss']
})
export class ArchiveSelectorComponent implements OnInit, OnDestroy, HasSubscriptions {
  @HostBinding('class.visible') @Input() visible: boolean;

  archive: ArchiveVO;
  subscriptions: Subscription[] = [];

  constructor(
    private accountService: AccountService
  ) {
    this.archive = this.accountService.getArchive();

    this.subscriptions.push(
      this.accountService.archiveChange.subscribe(newArchive => this.archive = newArchive)
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

}
