/* @format */
import { Component, OnInit, Input } from '@angular/core';
import { ArchiveVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { FeaturedArchive } from '../../types/featured-archive';

@Component({
  selector: 'pr-featured-archive',
  templateUrl: './featured-archive.component.html',
  styleUrls: ['./featured-archive.component.scss'],
})
export class FeaturedArchiveComponent implements OnInit {
  @Input() archive: FeaturedArchive;
  public thumbURL = '';
  public bannerURL = '';

  constructor(protected api: ApiService) {}

  async ngOnInit() {
    const archiveVO = (
      await this.api.archive.get([
        new ArchiveVO({ archiveNbr: this.archive.archiveNbr }),
      ])
    ).getArchiveVO();
    if (archiveVO.thumbURL200) {
      this.thumbURL = archiveVO.thumbURL200;
      const rootFolder = (
        await this.api.folder.getPublicRoot(archiveVO.archiveNbr)
      ).getFolderVO();
      if (rootFolder.thumbArchiveNbr && rootFolder.thumbURL500) {
        this.bannerURL = rootFolder.thumbURL500;
      }
    }
  }

  public getClasses(): string[] {
    const classes = ['featured-archive'];
    if (this.archive.type === 'type.archive.organization') {
      classes.push('organization');
    } else if (this.archive.type === 'type.archive.family') {
      classes.push('group');
    } else {
      classes.push('personal');
    }
    return classes;
  }

  public getArchiveType(): string {
    switch (this.archive.type) {
      case 'type.archive.person':
        return 'Personal';
      case 'type.archive.family':
        return 'Group';
      case 'type.archive.organization':
      case 'type.archive.nonprofit':
        return 'Organizational';
    }
  }
}
