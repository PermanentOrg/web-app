import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit } from '@angular/core';
import { Dialog } from './dialog.service';
import { PortalInjector } from '@root/vendor/portal-injector';

@Component({
  selector: 'pr-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements AfterViewInit {
  public isVisible = false;
  @ViewChild('dialogContent', {read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor(
  ) {
  }

  ngAfterViewInit() {
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
