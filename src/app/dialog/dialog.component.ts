import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit } from '@angular/core';
import { Dialog, DialogOptions, DialogRef } from './dialog.service';
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

  private dialogRef: DialogRef;

  @ViewChild('dialogContent', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild('menuWrapper', {read: ElementRef}) menuWrapperElement: ElementRef;

  constructor(
    private device: DeviceService
  ) {
  }

  ngAfterViewInit() {
  }

  bindDialogRef(dialogRef: DialogRef) {
    if (!this.dialogRef) {
      this.dialogRef = dialogRef;
    }
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

  onMenuClick(event) {
  }

  onMenuWrapperClick(event: MouseEvent) {
    if (event.target === this.menuWrapperElement.nativeElement) {
      this.dialogRef.close(null, true);
    }
  }

  onMenuWrapperScroll(event) {

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
