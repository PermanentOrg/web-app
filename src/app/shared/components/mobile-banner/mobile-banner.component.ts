/* @format */
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ngIfSlideUpAnimation } from '@shared/animations';
import { Component } from '@angular/core';
import { MobileBannerService } from '@shared/services/mobile-banner/mobile-banner.service';

@Component({
	selector: 'pr-mobile-banner',
	templateUrl: './mobile-banner.component.html',
	styleUrls: ['./mobile-banner.component.scss'],
	animations: [ngIfSlideUpAnimation],
	standalone: false,
})
export class MobileBannerComponent {
	public url = '';
	constructor(
		public bannerService: MobileBannerService,
		private prompt: PromptService,
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
						}?`,
					)
					.then(() => {
						window.location.href = this.url;
					});
			} catch (error) {}
		}, 1500);

		window.location.href = 'permanent://open.my.app';
	}
}
