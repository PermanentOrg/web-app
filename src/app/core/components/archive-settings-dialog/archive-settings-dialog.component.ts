import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { TagsService } from '@core/services/tags/tags.service';
import { TagVO } from '@models/tag-vo';

type ArchiveSettingsDialogTab = 'manage-tags';


@Component({
  selector: 'pr-archive-settings-dialog',
  templateUrl: './archive-settings-dialog.component.html',
  styleUrls: ['./archive-settings-dialog.component.scss']
})
export class ArchiveSettingsDialogComponent implements OnInit {
  public activeTab: ArchiveSettingsDialogTab = 'manage-tags';
  public tags: TagVO[] = [];
  public loadingTags: boolean = true;
  public hasAccess: boolean;

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    private account: AccountService,
    private tagsService: TagsService,
  ) { }

  public ngOnInit(): void {
    const accessRole = this.account.getArchive().accessRole;
    this.hasAccess = accessRole === "access.role.owner"; /*|| accessRole === "access.role.manager"*/
    if (this.hasAccess) {
      this.api.tag.getTagsByArchive(this.account.getArchive()).then((response) => {
        this.tags = response.getTagVOs();
        this.bindTagsToArchive();
        this.loadingTags = false;
      }).catch(() => {
        setTimeout(() => {
         this.ngOnInit()
       }, 1000);
     });
   }
  }

  public refreshTags(): void {
    this.tagsService.refreshTags();
    this.ngOnInit();
  }

  public onDoneClick(): void {
    this.dialogRef.close();
  }

  public setTab(tab: string): void {
    // do nothing for now
  }

  protected bindTagsToArchive(): void {
    const archiveId = this.account.getArchive()?.archiveId;
    for (let i = 0; i < this.tags.length; i++) {
      this.tags[i].archiveId = archiveId;
    }
  }
}
