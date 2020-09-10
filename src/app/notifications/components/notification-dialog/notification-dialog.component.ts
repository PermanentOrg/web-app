import { Component, OnInit, Inject, ViewChildren, AfterViewInit, OnDestroy, ElementRef, QueryList } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';
import { some } from 'lodash';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent implements OnInit, AfterViewInit, OnDestroy, HasSubscriptions {
  @ViewChildren(NotificationComponent) notificationComponents: QueryList<NotificationComponent>;

  subscriptions: Subscription[] = [];
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    public notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.markAllAsSeen();
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  markAllAsSeen(): void {
    this.notificationService.markAll('status.notification.seen');
  }

  markAllAsRead(): void {
    this.notificationService.markAll('status.notification.read');
  }
}
