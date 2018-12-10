import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit } from '@angular/core';
import { Dialog } from './dialog.service';

@Component({
  selector: 'pr-dialog-root',
  template: '<ng-template #dialogRoot></ng-template>',
  styleUrls: ['./dialog.component.scss']
})
export class DialogRootComponent {
  public isVisible = false;
  @ViewChild('dialogRoot', {read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor(
    public container: ViewContainerRef,
    private dialog: Dialog
  ) {
    this.dialog.registerRootComponent(this);
  }
}
