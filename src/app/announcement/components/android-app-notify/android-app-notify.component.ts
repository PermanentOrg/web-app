/* @format */
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';

import {
  adjustLayoutForAnnouncement,
  resetLayoutForAnnouncement,
} from '../announcement/announcement.component';

export interface BeforeInstallPromptEvent extends Event {
  userChoice: Promise<'accepted' | 'dismissed'>;
  prompt(): Promise<void>;
}

@Component({
  selector: 'pr-android-app-notify',
  templateUrl: './android-app-notify.component.html',
  styleUrls: ['./android-app-notify.component.scss'],
})
export class AndroidAppNotifyComponent implements OnInit {
  public static readonly storageKey = 'androidAppNotificationDismissed';
  public active = false;
  public deferredPrompt: BeforeInstallPromptEvent;

  constructor(public elementRef: ElementRef) {}

  @HostListener('window:beforeinstallprompt', ['$event'])
  public beforeInstallPrompt(event: BeforeInstallPromptEvent) {
    this.deferredPrompt = event;
    if (!localStorage.getItem(AndroidAppNotifyComponent.storageKey)) {
      this.active = true;
      adjustLayoutForAnnouncement(this);
    }
  }

  ngOnInit(): void {}

  public showPrompt(): void {
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(() => {
      this.active = false;
    });
  }

  public dismiss(): void {
    this.active = false;
    localStorage.setItem(AndroidAppNotifyComponent.storageKey, 'true');
    resetLayoutForAnnouncement();
  }
}
