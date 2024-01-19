/* @format */
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ngIfFadeInAnimation } from '@shared/animations';
import { Component } from '@angular/core';
import { BannerService } from '@shared/services/banner/banner.service';

@Component({
  selector: 'pr-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [ngIfFadeInAnimation],
})
export class BannerComponent {
  public url = '';
  constructor(
    public bannerService: BannerService,
    private prompt: PromptService
  ) {
    this.url = this.bannerService.isIos
      ? this.bannerService.appStoreUrl
      : this.bannerService.playStoreUrl;
  }

  closeBanner(event): void {
    event.stopPropagation();
    this.bannerService.hideBanner();
  }

  onClickBanner(): void {
    setTimeout(() => {
      try {
        this.prompt
          .confirm(
            'Yes',
            `Would you like to navigate to the ${
              this.bannerService.isIos ? 'App Store' : 'Google Play Store'
            }?`
          )
          .then(() => {
            window.location.href = this.url;
          });
      } catch (error) {}
    }, 1500);

    window.location.href = 'permanent://open.my.app';
  }
}
