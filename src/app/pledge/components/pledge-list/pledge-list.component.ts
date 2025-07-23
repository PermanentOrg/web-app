import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import { orderBy } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

interface PublicPledgeData {
	dollarAmount: number;
	name: string;
	timestamp: number;

	isNew?: boolean;
}

const LIMIT = 50;

interface KeyedPledges {
	[id: string]: PublicPledgeData;
}
@Component({
	selector: 'pr-pledge-list',
	templateUrl: './pledge-list.component.html',
	styleUrls: ['./pledge-list.component.scss'],
	standalone: false,
})
export class PledgeListComponent implements OnInit, OnDestroy {
	newPledgeRef = this.db.database
		.ref('/publicPledges')
		.orderByChild('timestamp')
		.startAt(new Date().getTime());
	newPledgeListener: any;

	latestPledgeRef = this.db.database.ref('/publicPledges').limitToLast(LIMIT);
	highestPledgeRef = this.db.database
		.ref('/publicPledges')
		.orderByChild('dollarAmount')
		.limitToLast(LIMIT);

	latestPledgesBs = new BehaviorSubject<PublicPledgeData[]>([]);
	highestPledgesBs = new BehaviorSubject<PublicPledgeData[]>([]);

	activeList: 'latest' | 'highest' = 'latest';
	pledges$: Observable<PublicPledgeData[]>;

	constructor(
		private db: AngularFireDatabase,
		private zone: NgZone,
	) {}

	async ngOnInit() {
		this.onChangePledges();

		const latest = (
			await this.latestPledgeRef.once('value')
		).val() as KeyedPledges;
		const highest = (
			await this.highestPledgeRef.once('value')
		).val() as KeyedPledges;

		this.latestPledgesBs.next(
			orderBy(Object.values(latest), 'timestamp', 'desc'),
		);
		this.highestPledgesBs.next(
			orderBy(Object.values(highest), 'dollarAmount', 'desc'),
		);

		this.newPledgeListener = this.newPledgeRef.on('child_added', (snapshot) => {
			this.zone.run(() => {
				const newPledge = snapshot.val() as PublicPledgeData;
				this.addPledge(newPledge);
			});
		});
	}

	addPledge(newPledge: PublicPledgeData) {
		newPledge.isNew = true;
		setTimeout(() => {
			newPledge.isNew = false;
		}, 5000);

		const latest = [newPledge, ...this.latestPledgesBs.value];
		const highest = orderBy(
			[newPledge, ...this.highestPledgesBs.value],
			'dollarAmount',
			'desc',
		);

		this.latestPledgesBs.next(latest);
		this.highestPledgesBs.next(highest);
	}

	onChangePledges() {
		const bs: BehaviorSubject<PublicPledgeData[]> =
			this.activeList === 'highest'
				? this.highestPledgesBs
				: this.latestPledgesBs;
		this.pledges$ = bs.asObservable();
	}

	ngOnDestroy(): void {
		this.newPledgeRef.off('child_added', this.newPledgeListener);
	}
}
