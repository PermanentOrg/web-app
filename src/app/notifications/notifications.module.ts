import { NgModule, Optional, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationDialogComponent } from './components/notification-dialog/notification-dialog.component';

@NgModule({
  declarations: [NotificationComponent, NotificationDialogComponent],
  imports: [CommonModule, SharedModule],
  providers: [NotificationService],
  exports: [NotificationComponent, NotificationDialogComponent],
})
export class NotificationsModule {}
