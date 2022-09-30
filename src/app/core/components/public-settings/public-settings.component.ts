/* @format */
import { Component, Input, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-public-settings',
  templateUrl: './public-settings.component.html',
  styleUrls: ['./public-settings.component.scss'],
})
export class PublicSettingsComponent implements OnInit {
  @Input() public archive: ArchiveVO;
  public updating: boolean = false;
  public allowDownloadsToggle: number = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.allowDownloadsToggle = +this.archive.allowPublicDownload;
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
}
