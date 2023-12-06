/* @format */
import {
  Component,
  ViewContainerRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { DeviceService } from '@shared/services/device/device.service';
import { DialogOptions, DialogRef } from './dialog.service';

@Component({
  selector: 'pr-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements AfterViewInit {
  public isVisible = false;
  public height = 'fullscreen';
  public width = 'fullscreen';
  public mobileWidth: string;
  public borderRadius = '0px';

  public menuClass: string;

  private dialogRef: DialogRef;

  @ViewChild('dialogContent', { read: ViewContainerRef, static: true })
  viewContainer: ViewContainerRef;
  @ViewChild('menuWrapper', { read: ElementRef, static: true })
  menuWrapperElement: ElementRef;

  constructor(private device: DeviceService) {}

  ngAfterViewInit() {}

  bindDialogRef(dialogRef: DialogRef) {
    if (!this.dialogRef) {
      this.dialogRef = dialogRef;
    }
  }

  setOptions(options?: DialogOptions) {
    if (options) {
      if (options.height) {
        this.height = options.height;
      }

      if (options.width) {
        this.width = options.width;
      }

      if (options.mobileWidth) {
        this.mobileWidth = options.mobileWidth;
        this.width =
          this.width === options.width ? this.width : options.mobileWidth;
      }

      if (options.borderRadius) {
        this.borderRadius = options.borderRadius;
      }

      if (options.menuClass) {
        this.menuClass = options.menuClass;
      }
    }
  }

  isMobile() {
    return this.device.isMobileWidth();
  }

  onMenuClick(event) {}

  onMenuWrapperClick(event: MouseEvent) {
    if (event.target === this.menuWrapperElement.nativeElement) {
      this.dialogRef.close(null, true);
    }
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
