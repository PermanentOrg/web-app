import { Injectable } from '@angular/core';
import { EventObserver } from '@shared/services/event/event.service';
import { Subject } from 'rxjs';
import { PermanentEvent } from '@shared/services/event/event-types';

@Injectable({
  providedIn: 'root',
})
export class ChecklistEventObserverService implements EventObserver {
  private subject = new Subject<void>();

  constructor() {}

  public async update(_: PermanentEvent): Promise<void> {
    this.subject.next();
  }

  public getSubject(): Subject<void> {
    return this.subject;
  }
}
