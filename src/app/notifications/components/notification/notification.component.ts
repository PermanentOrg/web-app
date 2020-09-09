import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { NotificationVOData } from '@models/notification-vo';

@Component({
  selector: 'pr-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() notification: NotificationVOData;
  element: HTMLElement;

  constructor(
    private elementRef: ElementRef
  ) {
    this.element = elementRef.nativeElement as HTMLElement;
  }

  ngOnInit(): void {
  }

}
