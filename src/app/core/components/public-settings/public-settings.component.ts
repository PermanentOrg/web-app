/* @format */
import { Component, Input, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveType } from '@models/archive-vo';
import { Dialog } from '@root/app/dialog/dialog.service';

@Component({
  selector: 'pr-public-settings',
  templateUrl: './public-settings.component.html',
  styleUrls: ['./public-settings.component.scss'],
})
export class PublicSettingsComponent implements OnInit {
  @Input() public archive: ArchiveVO;
  public updating: boolean = false;
  public allowDownloadsToggle: number = 0;

  public archiveTypes:  {value:string,
                          name:string}[] = 
  [
    {value:'type.archive.family',name:'Group'},
    {
      value:'type.archive.organization',name:'Organization'
    },
    {
      value:'type.archive.person',name:'Person'
    }
  ]

  public archiveType: ArchiveType | any = 'type.archive.organization';

  constructor(private api: ApiService,private dialog:Dialog) {}

  ngOnInit(): void {
    this.allowDownloadsToggle = +this.archive.allowPublicDownload;
    this.archiveType=this.archive.type;
  }

  public async onAllowDownloadsChange() {
    this.archive.allowPublicDownload = !!this.allowDownloadsToggle;
    this.updating = true;
    try {
      await this.api.archive.update(this.archive);
    } catch {
      // fail silently
    } finally {
      this.updating = false;
    }
  }

  public setArchiveType(value: ArchiveType) {
    this.archiveType = value;
  }

  public async onArchiveTypeChange() {
   this.dialog.open('ArchiveTypeChangeDialogComponent', { archive:this.archive, archiveType:this.archiveType, setArchiveType:this.setArchiveType }, {
     width: '1000px',
   });

  }
}
