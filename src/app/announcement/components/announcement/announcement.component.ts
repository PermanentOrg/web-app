/* @format */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

import { AnnouncementEvent } from '@announcement/models/announcement-event';
import { ANNOUNCEMENT_EVENTS } from '@announcement/data/events';

import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

const STORAGE_KEY = 'announcementDismissed';

export const adjustLayoutForAnnouncement = (component: {
  elementRef: ElementRef;
}) => {
  const self = component.elementRef.nativeElement as HTMLElement;
  const adjustedElements = document.querySelectorAll(
    '.adjust-for-announcement',
  );
  for (const element of Array.from(adjustedElements)) {
    (element as HTMLElement).style.paddingTop =
      self.getBoundingClientRect().height + 'px';
  }
};

export const resetLayoutForAnnouncement = () => {
  const adjustedElements = document.querySelectorAll(
    '.adjust-for-announcement',
  );
  for (const element of Array.from(adjustedElements)) {
    (element as HTMLElement).style.paddingTop = '0px';
  }
};

@Component({
  selector: 'pr-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  standalone: false,
})
export class AnnouncementComponent implements OnInit, AfterViewInit {
  @Input() eventsList: AnnouncementEvent[] = ANNOUNCEMENT_EVENTS;
  public active: boolean = false;
  public event: AnnouncementEvent;
  public faWindowClose = faWindowClose;
  constructor(public elementRef: ElementRef) {}

  public ngOnInit(): void {
    if (!this.eventsList) {
      this.eventsList = [];
    }
    this.event = this.findActiveEvent();
    this.active = !!this.event && !this.isDismissed();
  }

  public ngAfterViewInit(): void {
    if (this.active) {
      adjustLayoutForAnnouncement(this);
    }
  }

  public dismiss(): void {
    this.active = false;
    window.localStorage.setItem(STORAGE_KEY, this.event.start.toString());

    resetLayoutForAnnouncement();
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
    return this.eventsList.find(
      (event) => now >= event.start && now < event.end,
    );
  }
}
