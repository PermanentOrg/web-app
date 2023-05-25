import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'pr-public-archive-web-links',
  templateUrl: './public-archive-web-links.component.html',
  styleUrls: ['./public-archive-web-links.component.scss'],
})
export class PublicArchiveWebLinksComponent implements OnInit {
  componentName: string = 'public-archive-web-links';

  @Input() description: string = '';
  @Input() emails: string[] = [];
  @Input() websites: string[] = [];


  constructor() {}

  ngOnInit(): void {}

  navigate(url: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    window.open(url, '_blank');
  }

  navigateToMail(mail:string): void {
    window.open('mailto:' + mail, '_blank');
  }

  isFacebookUrl(url) {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : 'https://' + url);
      return ['www.facebook.com', 'm.facebook.com', 'facebook.com', 'fb.me'].includes(parsedUrl.hostname);
    } catch (_) {
      return false; // invalid URL
    }
  }
}
