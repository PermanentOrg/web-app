import { Component, Input } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-glam-pending-archives',
  templateUrl: './glam-pending-archives.component.html',
  styleUrl: './glam-pending-archives.component.scss',
})
export class GlamPendingArchivesComponent {
  @Input() pendingArchives: ArchiveVO[] = [];

  public accountName: string = '';

  constructor(private account: AccountService) {
    this.accountName = this.account.getAccount().fullName;
  }
}
