/* @format */
import { ngIfFadeInAnimation } from '@shared/animations';
import { Component, HostBinding } from '@angular/core';
import { BannerService } from '@shared/services/banner/banner.service';

@Component({
  selector: 'pr-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [ngIfFadeInAnimation],
})
export class BannerComponent {
  public showFallbackMessage = false;
  public displayBanner = false;
  public url = '';
  constructor(public bannerService: BannerService) {
    this.displayBanner = this.bannerService.isVisible;
    this.url = this.bannerService.isIos
      ? this.bannerService.appStoreUrl
      : this.bannerService.playStoreUrl;
  }

  closeBanner(): void {
    this.bannerService.hideBanner();
  }

  onClickBanner(): void {
    let attemptedToOpenApp = false;

    window.open('permanent://open.my.app', '_blank');
    attemptedToOpenApp = true;

    setTimeout(() => {
      if (attemptedToOpenApp) {
        if (document.hasFocus()) {
          window.location.replace(this.url);
        }
      }
    }, 2500);
  }
}
