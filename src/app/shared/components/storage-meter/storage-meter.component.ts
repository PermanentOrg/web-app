import { Subscription } from 'rxjs';
import { ApiService } from './../../services/api/api.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO, ArchiveVO } from '@models';

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

  constructor(private accountService: AccountService, private api: ApiService) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.animate = true;
    });
    if (this.showForArchive) {
      this.getArchiveStorage();

      this.accountChangeSubscription =
        this.accountService.archiveChange.subscribe((archive: ArchiveVO) => {
          if (this.showForArchive) {
            this.getArchiveStorage();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.accountChangeSubscription?.unsubscribe()
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
