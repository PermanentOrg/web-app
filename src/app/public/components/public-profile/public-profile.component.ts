import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveVO } from '@models';
import {
	ProfileItemVODictionary,
	ProfileItemVOData,
} from '@models/profile-item-vo';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { map } from 'rxjs/operators';
import { concat, orderBy } from 'lodash';

@Component({
	selector: 'pr-public-profile',
	templateUrl: './public-profile.component.html',
	styleUrls: ['./public-profile.component.scss'],
	standalone: false,
})
export class PublicProfileComponent
	implements OnInit, OnDestroy, HasSubscriptions
{
	archive: ArchiveVO;
	profileItems: ProfileItemVODictionary = {};
	milestones$: Observable<ProfileItemVOData[]>;
	milestoneSortOrder$ = new BehaviorSubject<'asc' | 'desc'>('desc');

	subscriptions: Subscription[] = [];
	constructor(private publicProfile: PublicProfileService) {}

	ngOnInit(): void {
		this.subscriptions.push(
			this.publicProfile
				.archive$()
				.subscribe((archive) => (this.archive = archive)),
			this.publicProfile
				.profileItemsDictionary$()
				.subscribe((items) => (this.profileItems = items)),
		);

		this.milestones$ = combineLatest([
			this.publicProfile.profileItemsDictionary$(),
			this.milestoneSortOrder$,
		]).pipe(
			map(([profileItems, sortOrder]) => {
				const milestones = concat(
					profileItems.job || [],
					profileItems.home || [],
					profileItems.milestone || [],
				);
				return orderBy(milestones, (i) => i.day1, sortOrder);
			}),
		);
	}

	toggleMilestoneSortOrder(): void {
		const currentOrder = this.milestoneSortOrder$.value;
		this.milestoneSortOrder$.next(currentOrder === 'desc' ? 'asc' : 'desc');
	}

	ngOnDestroy(): void {
		unsubscribeAll(this.subscriptions);
	}
}
