import { Injectable } from '@angular/core';
import { AnalyticsObserver } from '@shared/services/analytics/analytics.service';
import { MixpanelData } from '@shared/services/mixpanel/mixpanel.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChecklistAnalyticsObserverService implements AnalyticsObserver {
  private subject = new Subject<void>();

  constructor() {}

  public async update(_: MixpanelData): Promise<void> {
    this.subject.next();
  }

  public getSubject(): Subject<void> {
    return this.subject;
  }
}
