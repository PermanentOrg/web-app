import { NgModule, Optional, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { DialogChildComponentData, Dialog } from '../dialog/dialog.module';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationDialogComponent } from './components/notification-dialog/notification-dialog.component';

@NgModule({
  declarations: [NotificationComponent, NotificationDialogComponent],
  imports: [
    CommonModule,
    SharedModule
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
