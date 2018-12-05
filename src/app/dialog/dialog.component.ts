import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Dialog } from './dialog.service';

@Component({
  selector: 'pr-dialog',
  template: '',
})
export class DialogComponent implements OnInit {

  constructor(
    public container: ViewContainerRef,
    private dialog: Dialog
  ) {
    this.dialog.registerRootComponent(this);
  }

  ngOnInit() {
  }

}
