import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { throttle } from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class ScrollService {
	private subject: Subject<Event> = new Subject();

	private throttled = throttle((event: Event) => {
		// this.subject.next(event);
	}, 64);

	scrollEvent(event: Event) {
		this.throttled(event);
	}

	getScrolls() {
		return this.subject.asObservable();
	}
}
