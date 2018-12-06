import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding } from '@angular/core';
import { Dialog } from './dialog.service';

@Component({
  selector: 'pr-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  public isVisible = false;
  @ViewChild('dialogContent', {read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor(
    public container: ViewContainerRef,
    private dialog: Dialog
  ) {
    this.dialog.registerRootComponent(this);
  }

  ngOnInit() {
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }
}
