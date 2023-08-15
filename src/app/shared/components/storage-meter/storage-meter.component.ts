import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { UploadService } from '@core/services/upload/upload.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO, ArchiveVO, FolderVO } from '@models';
import { UploadSessionStatus } from '@core/services/upload/upload.session';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'pr-storage-meter',
  templateUrl: './storage-meter.component.html',
  styleUrls: ['./storage-meter.component.scss'],
})
export class StorageMeterComponent implements OnInit, OnDestroy {
  account: AccountVO;
  @Input() showForArchive = false;

  animate = false;
  private archiveSpaceLeft: number = 0;
  private archiveSpaceTotal: number = 0;

  private accountChangeSubscription: Subscription;
  private deleteSubscription: Subscription;

  subscriptions: Subscription[] = [];

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private upload: UploadService,
    private edit: EditService,
    private dataService: DataService
  ) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.animate = true;
    });
    if (this.showForArchive) {
      this.getArchiveStorage();

      this.subscriptions.push(
        this.accountService.archiveChange.subscribe(() => {
          if (this.showForArchive) {
            this.getArchiveStorage();
          }
        }),

        this.dataService.folderUpdate.subscribe(() => {
          this.getArchiveStorage();
        }),

        this.edit.deleteNotifier$.subscribe(() => {
          this.getArchiveStorage();
        }),
      );
    }
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  getMeterWidth() {
    let widthFraction;

    if (this.showForArchive) {
      widthFraction = Math.min(
        (this.archiveSpaceTotal - this.archiveSpaceLeft) /
          this.archiveSpaceTotal,
        1
      );
    } else {
      widthFraction = Math.min(
        (this.account.spaceTotal - this.account.spaceLeft) /
          this.account.spaceTotal,
        1
      );
    }

    return `${widthFraction * 100}%`;
  }

  getMeterTransform() {
    if (!this.animate) {
      return null;
    }

    let widthFraction;
    if (this.showForArchive) {
      widthFraction = Math.min(
        (this.archiveSpaceTotal - this.archiveSpaceLeft) /
          this.archiveSpaceTotal,
        1
      );
    } else {
      widthFraction = Math.min(
        (this.account.spaceTotal - this.account.spaceLeft) /
          this.account.spaceTotal,
        1
      );
    }
    return `transform: translateX(${widthFraction * 100 - 100}%)`;
  }

  getArchiveStorage() {
    const archiveId = this.accountService.getArchive()?.archiveId;

    this.api.archive.getArchiveStorage(archiveId).then((res) => {
      this.archiveSpaceLeft = Number(res.spaceLeft);
      this.archiveSpaceTotal = Number(res.spaceTotal);
    });
  }
}
