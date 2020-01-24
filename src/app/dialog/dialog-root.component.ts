import { Component, OnInit, ViewContainerRef, ViewChild, HostBinding, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Dialog } from './dialog.service';

@Component({
  selector: 'pr-dialog-root',
  template: '<ng-template #dialogRoot></ng-template>',
  styleUrls: ['./dialog.component.scss']
})
export class DialogRootComponent implements OnDestroy {
  public isVisible = false;
  @ViewChild('dialogRoot', { read: ViewContainerRef, static: true }) viewContainer: ViewContainerRef;

  constructor(
    public container: ViewContainerRef,
    private dialog: Dialog
  ) {
    this.dialog.registerRootComponent(this);
  }

  ngOnDestroy() {
    this.dialog.unregisterRootComponent();
  }
}
