import { Component, OnInit, Input } from '@angular/core';
import { NotificationVOData } from '@models/notification-vo';

@Component({
  selector: 'pr-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() notification: NotificationVOData;

  constructor() { }

  ngOnInit(): void {
  }

}
