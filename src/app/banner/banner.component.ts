/* @format */
import { ngIfFadeInAnimation } from '@shared/animations';
import { Component, HostBinding } from '@angular/core';
import { BannerService } from './banner.service';

@Component({
  selector: 'pr-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [ngIfFadeInAnimation],
})
export class BannerComponent {
  public displayBanner = false;
  public url = '';
  constructor(public bannerService: BannerService) {
    this.displayBanner = this.bannerService.isVisible;
    this.url = !this.bannerService.isIos
      ? this.bannerService.appStoreUrl
      : this.bannerService.playStoreUrl;
  }

  closeBanner(): void {
    this.bannerService.hideBanner();
  }

  onClickBanner(): void {
    window.open(this.url, '_blank');
    this.bannerService.hideBanner();
  }
}
