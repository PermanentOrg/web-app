/* @format */
import { Component, OnInit, Input } from '@angular/core';
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
  public classNames: string[] = ['featured-archive'];
  protected api: any;

  constructor() {}

  async ngOnInit() {
    this.classNames = this.getClasses();
  }

  public getClasses(): string[] {
    const classes = ['featured-archive'];
    if (this.archive.type === 'type.archive.person') {
      classes.push('personal');
    } else if (this.archive.type === 'type.archive.family') {
      classes.push('group');
    } else {
      classes.push('organization');
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

  public getArchiveLink(): string {
    return ['/p', 'archive', this.archive.archiveNbr].join('/');
  }
}
