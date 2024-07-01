import { Injectable } from '@angular/core';
import { EventObserver } from '@shared/services/event/event.service';
import { MixpanelData } from '@shared/services/mixpanel/mixpanel.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChecklistAnalyticsObserverService implements EventObserver {
  private subject = new Subject<void>();

  constructor() {}

  public async update(_: MixpanelData): Promise<void> {
    this.subject.next();
  }

  public getSubject(): Subject<void> {
    return this.subject;
  }
}
