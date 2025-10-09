import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import { Subject } from 'rxjs';
import { AccountService } from '../account/account.service';
import { DeviceService } from '../device/device.service';
import { StorageService } from '../storage/storage.service';
import { GuidedTourEvent } from './events';
import { GuidedTourHistory, TourName, TourStep } from './history';

import type { ShepherdStep } from './step';

const STORAGE_KEY = 'guidedTour';

type AllTourHistory = Record<number, GuidedTourHistory>;

@Injectable({
	providedIn: 'root',
})
export class GuidedTourService {
	private eventsSubject = new Subject<GuidedTourEvent>();

	constructor(
		private shepherd: ShepherdService,
		private storage: StorageService,
		private account: AccountService,
		private device: DeviceService,
	) {
		this.shepherd.modal = true;
	}
	startTour(steps: ShepherdStep[]) {
		// Convert to any type since angular-shepherd is expecting the StepOptions[]
		// type but it does not expose this type at all so we can't use it.
		this.shepherd.addSteps(steps as any);
		setTimeout(() => {
			this.shepherd.start();
		});

		return this.shepherd.tourObject;
	}

	emit(event: GuidedTourEvent, data?: any) {
		this.eventsSubject.next(event);
	}

	next() {
		this.shepherd.next();
	}

	events$() {
		return this.eventsSubject.asObservable();
	}

	private getAllHistory(): AllTourHistory {
		return this.storage.local.get<AllTourHistory>(STORAGE_KEY) || {};
	}

	private getHistoryForAccount(): GuidedTourHistory {
		const account = this.account.getAccount();
		const allHistory = this.getAllHistory();
		return allHistory[account.accountId] || {};
	}

	isStepComplete(tour: TourName, step: TourStep, skipMobile = true): boolean {
		if (skipMobile && this.device.isMobileWidth()) {
			return true;
		}

		const history = this.getHistoryForAccount();

		if (history[tour]) {
			return !!history[tour][step];
		} else {
			return false;
		}
	}

	markStepComplete(tour: TourName, step: TourStep) {
		const history = this.getHistoryForAccount();
		if (!history[tour]) {
			history[tour] = {};
		}

		history[tour][step] = true;

		const account = this.account.getAccount();
		const allHistory = this.getAllHistory();

		allHistory[account.accountId] = history;
		this.storage.local.set<AllTourHistory>(STORAGE_KEY, allHistory);
	}
}
