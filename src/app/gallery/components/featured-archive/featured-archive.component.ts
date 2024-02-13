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
  public classNames: string[] = ['featured-archive'];

  constructor() {}

  async ngOnInit() {
    this.classNames = this.getClasses();
  }

  public getClasses(): string[] {
    const classes = ['featured-archive'];
    if (this.archive.type === 'type.archive.person') {
      classes.push('personal');
    } else if (this.archive.type === 'type.archive.group') {
      classes.push('group');
    } else {
      classes.push('organization');
    }
    return classes;
  }

  public getArchiveLink(): string {
    return ['/p', 'archive', this.archive.archiveNbr].join('/');
  }
}
