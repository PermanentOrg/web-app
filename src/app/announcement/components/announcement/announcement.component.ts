import { Component, Input, OnInit } from '@angular/core';

import { AnnouncementEvent } from '@announcement/models/announcement-event';
import { ANNOUNCEMENT_EVENTS } from '@announcement/data/events';

const STORAGE_KEY = 'announcementDismissed';

@Component({
  selector: 'pr-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {
  @Input() eventsList: AnnouncementEvent[] = ANNOUNCEMENT_EVENTS;
  public active: boolean = false;
  public event: AnnouncementEvent;
  constructor() {}

  public ngOnInit(): void {
    if (!this.eventsList) {
      this.eventsList = [];
    }
    const now = Date.now();
    this.event = this.findActiveEvent();
    this.active = !!this.event && !this.isDismissed();
  }

  public dismiss(): void {
    this.active = false;
    window.localStorage.setItem(STORAGE_KEY, this.event.start.toString());
  }

  protected isDismissed(): boolean {
    const dismissedValue = window.localStorage.getItem(STORAGE_KEY);
    if (dismissedValue && this.event) {
      return dismissedValue === this.event.start.toString();
    }
    return false;
  }

  protected findActiveEvent(): AnnouncementEvent | undefined {
    const now = Date.now();
    return this.eventsList.find((event) => {
      return now >= event.start && now < event.end;
    });
  }
}
