import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit } from '@angular/core';
import { Dialog, DialogOptions } from './dialog.service';
import { PortalInjector } from '@root/vendor/portal-injector';
import { DeviceService } from '@shared/services/device/device.service';

@Component({
  selector: 'pr-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements AfterViewInit {
  public isVisible = false;
  public height = 'fullscreen';
  public width = 'fullscreen';

  @ViewChild('dialogContent', {read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor(
    private device: DeviceService
  ) {
  }

  ngAfterViewInit() {
  }

  setOptions(options ?: DialogOptions) {
    if (options) {
      if (options.height) {
        this.height = options.height;
      }

      if (options.width) {
        this.width = options.width;
      }
    }
  }

  isMobile() {
    return this.device.isMobileWidth();
  }

  show() {
    setTimeout(() => {
      this.isVisible = true;
    });
  }

  hide() {
    this.isVisible = false;
  }
}
