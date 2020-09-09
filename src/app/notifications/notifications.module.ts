import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule
  ],
  providers: [
    NotificationService
  ],
  exports: [
    NotificationComponent
  ]
})
export class NotificationsModule { }
