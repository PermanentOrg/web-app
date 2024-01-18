/* @format */
import { DeviceService } from '@shared/services/device/device.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private _isVisible = false;
  private _appStoreUrl =
    'https://apps.apple.com/app/permanent-archive/id1571883070' as const;
  private _playStoreUrl =
    'https://play.google.com/store/apps/details?id=org.permanent.PermanentArchive' as const;

  private _isIos = false;

  constructor(private device: DeviceService) {
    this._isVisible = this.device.isAndroid() || this.device.isIos();
    if (this.device.isIos()) {
      this._isIos = true;
    }
  }

  get isIos(): boolean {
    return this._isIos;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get appStoreUrl(): string {
    return this._appStoreUrl;
  }

  get playStoreUrl(): string {
    return this._playStoreUrl;
  }

  hideBanner(): void {
    this._isVisible = false;
  }
}
