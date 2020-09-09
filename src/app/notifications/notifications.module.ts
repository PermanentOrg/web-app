import { NgModule, Optional, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationDialogComponent } from './components/notification-dialog/notification-dialog.component';
import { DialogChildComponentData, Dialog } from '../dialog/dialog.module';

@NgModule({
  declarations: [NotificationComponent, NotificationDialogComponent],
  imports: [
    CommonModule
  ],
  providers: [
    NotificationService
  ],
  exports: [
    NotificationComponent,
    NotificationDialogComponent
  ]
})
export class NotificationsModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'NotificationDialogComponent',
      component: NotificationDialogComponent
    },
  ];

  constructor(
    @Optional() private dialog?: Dialog,
    @Optional() private resolver?: ComponentFactoryResolver,
    ) {

    if (this.dialog) {
      this.dialog.registerComponents(this.dialogComponents, this.resolver, true);
    }
  }
}
