import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'pr-public-archive-web-links',
  templateUrl: './public-archive-web-links.component.html',
  styleUrls: ['./public-archive-web-links.component.scss'],
})
export class PublicArchiveWebLinksComponent implements OnInit {
  componentName: string = 'public-archive-web-links';

  @Input() description: string = '';
  @Input() email: string = '';
  @Input() website: string = '';
  @Input() facebook: string = '';

  constructor() {}

  ngOnInit(): void {}

  navigate(url: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    window.open(url, '_blank');
  }
}
