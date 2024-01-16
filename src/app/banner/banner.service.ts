/* @format */
import { DeviceService } from '@shared/services/device/device.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private _isVisible = true;

  constructor(private device: DeviceService) {
    console.log(this.device.isIos())
    console.log(this.device.isMobile())

  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  hideBanner(): void {
    this._isVisible = false;
  }
}
