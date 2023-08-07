import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';
import { AccountVO } from "../../../models/account-vo";
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { TagsService } from '@core/services/tags/tags.service';
import { TagVO } from '@models/tag-vo';
import { ArchiveVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

type ArchiveSettingsDialogTab =
  | 'manage-keywords'
  | 'manage-metadata'
  | 'public-settings'
  | 'legacy-planning';

@Component({
  selector: 'pr-archive-settings-dialog',
  templateUrl: './archive-settings-dialog.component.html',
  styleUrls: ['./archive-settings-dialog.component.scss'],
})
export class ArchiveSettingsDialogComponent implements OnInit {
  public readonly MAX_FETCH_ATTEMPTS: number = 5;
  public activeTab: ArchiveSettingsDialogTab = 'manage-keywords';
  public tags: TagVO[] = [];
  public loadingTags: boolean = true;
  public hasTagsAccess: boolean;
  public hasStewardAccess: boolean;
  public archive: ArchiveVO;
  public payer: AccountVO;

  protected fetchTagsAttempts: number = 0;

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    private account: AccountService,
    private tagsService: TagsService,
    public route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    const accessRole = this.account.getArchive().accessRole;
    this.hasTagsAccess =
      accessRole === 'access.role.owner' ||
      accessRole === 'access.role.manager';
    this.hasStewardAccess = accessRole === 'access.role.owner';
    if (this.hasTagsAccess) {
      this.api.tag
        .getTagsByArchive(this.account.getArchive())
        .then((response) => {
          this.tags = response.getTagVOs();
          this.bindTagsToArchive();
          this.loadingTags = false;
        })
        .catch(() => {
          setTimeout(() => {
            this.fetchTagsAttempts++;
            if (this.fetchTagsAttempts < this.MAX_FETCH_ATTEMPTS) {
              this.ngOnInit();
            } else {
              throw new Error(
                'Archive Settings: Maximum number of tag fetch attempts reached.'
              );
            }
          }, 1000);
        });
    }
    this.archive = this.account.getArchive();
    this.api.archive.getMembers(this.archive).then((response) => {
      const members = response.getAccountVOs();
      this.payer = members.find(
        (member) => member.accountId === this.archive.payerAccountId
      );
    });
  }

  public refreshTags(): void {
    // Wait a bit for the back end to catch up.
    setTimeout(() => {
      this.tagsService.resetTags();
      this.ngOnInit();
    }, 500);
  }

  public onDoneClick(): void {
    this.dialogRef.close();
  }

  public setTab(tab: ArchiveSettingsDialogTab): void {
    this.activeTab = tab;
  }

  protected bindTagsToArchive(): void {
    const archiveId = this.account.getArchive()?.archiveId;
    for (let i = 0; i < this.tags.length; i++) {
      this.tags[i].archiveId = archiveId;
    }
  }
}
