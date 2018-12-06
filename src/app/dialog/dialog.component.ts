import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit } from '@angular/core';
import { Dialog } from './dialog.service';

@Component({
  selector: 'pr-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements AfterViewInit {
  public isVisible = false;
  @ViewChild('dialogContent', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild('menuWrapper', {read: ElementRef}) menuWrapper: ElementRef;

  constructor(
    public container: ViewContainerRef,
    private dialog: Dialog
  ) {
    this.dialog.registerRootComponent(this);
  }

  ngAfterViewInit() {
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }
}
