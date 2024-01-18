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

    try {
      if (this.bannerService.isIos) {
        // window.open('permanent://openapp', '_blank');
       const test2 = window.open('permanent://openapp')
      const test = window.open(this.url)

       console.log(test)
       console.log(test2)

        attemptedToOpenApp = true;
      } else {
        // Android-specific logic
      }
    } catch (error) {
      console.log('here')
      window.location.href = this.url; // Use href for redirection
    }


    // setTimeout(() => {
    if (attemptedToOpenApp) {
      // Check if the user is still on the same page
      // Note: This is a heuristic approach and may not be 100% reliable
      if (document.hasFocus()) {
      }
    }
  }

  onFallbackClick(): void {
    window.location.replace(this.url);
  }
}
