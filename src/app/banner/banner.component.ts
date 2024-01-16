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
  @HostBinding('@ng') slideBanner = true;
  constructor(public bannerService: BannerService) {}

  closeBanner(): void {
    this.bannerService.hideBanner();
  }
}
