import { Injectable } from '@angular/core';
import { EventObserver } from '@shared/services/event/event.service';
import { Subject } from 'rxjs';
import { PermanentEvent } from '@shared/services/event/event-types';

@Injectable({
	providedIn: 'root',
})
export class ChecklistEventObserverService implements EventObserver {
	private subject = new Subject<void>();
	private delayMs: number = 1000;

	constructor() {}

	public async update(_: PermanentEvent): Promise<void> {
		setTimeout(() => {
			this.subject.next();
		}, this.delayMs);
	}

	public getSubject(): Subject<void> {
		return this.subject;
	}

	public setDelay(ms: number): void {
		this.delayMs = ms;
	}
}
