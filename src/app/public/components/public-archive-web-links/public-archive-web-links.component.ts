/* @format */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pr-public-archive-web-links',
  templateUrl: './public-archive-web-links.component.html',
  styleUrls: ['./public-archive-web-links.component.scss'],
  standalone: false,
})
export class PublicArchiveWebLinksComponent {
  componentName: string = 'public-archive-web-links';

  @Input() description: string = '';
  @Input() emails: string[] = [];
  @Input() websites: string[] = [];

  constructor() {}
}
