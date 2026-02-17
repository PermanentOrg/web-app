import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ArchiveVO, FolderVO } from '@models';
import { collapseAnimationCustom } from '@shared/animations';
import {
	FieldNameUIShort,
	ProfileItemVODictionary,
} from '@models/profile-item-vo';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { of, merge, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { GetBanner } from '@models/get-thumbnail';

@Component({
	selector: 'pr-public-archive',
	templateUrl: './public-archive.component.html',
	styleUrls: ['./public-archive.component.scss'],
	animations: [collapseAnimationCustom(250)],
	standalone: false,
})
export class PublicArchiveComponent implements OnInit, OnDestroy {
	publicRoot: FolderVO;
	archive: ArchiveVO;
	profileItems: ProfileItemVODictionary = {};
	description: string;
	searchResults: any[] = [];
	showShortText = true;
	characterLimit = 100;
	shortText = '';
	emails: string[] = [];
	websites: string[] = [];

	get bannerThumbnail(): string | null {
		return this.publicRoot?.thumbArchiveNbr ? GetBanner(this.publicRoot) : null;
	}
	showProfileInformation: boolean = false;

	waiting = true;

	query: string = '';

	isViewingProfile$ = merge(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map((event) => {
				if (event instanceof NavigationEnd) {
					return event.url.includes('/profile');
				}
			}),
		),
		of(this.router.url.includes('/profile')),
	);
	subscriptions: Subscription[] = [];
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private publicProfile: PublicProfileService,
	) {}

	ngOnInit(): void {
		this.subscriptions.push(
			this.publicProfile
				.publicRoot$()
				.subscribe((root) => (this.publicRoot = root)),
			this.publicProfile
				.archive$()
				.subscribe((archive) => (this.archive = archive)),
			this.publicProfile
				.profileItemsDictionary$()
				.subscribe((items) => (this.profileItems = items)),
			this.publicProfile
				.profileItemsDictionary$()
				.subscribe(
					(items) =>
						(this.description = items.description
							? items.description[0].textData1
							: ''),
				),
			this.publicProfile.profileItemsDictionary$().subscribe((items) => {
				this.emails = items.email
					? items.email.map((item) => item.string1)
					: [];
				this.websites = items.social_media
					? items.social_media.map((item) => item.string1)
					: [];
			}),
			this.publicProfile.profileItemsDictionary$().subscribe((items) => {
				if (this.description.length > this.characterLimit) {
					this.shortText = this.description
						? this.description.slice(0, this.characterLimit)
						: '';
				} else {
					this.showShortText = false;
				}
			}),
		);
	}

	ngOnDestroy(): void {
		unsubscribeAll(this.subscriptions);
	}

	hasSingleValueFor(field: FieldNameUIShort, column: ProfileItemsDataCol) {
		return (
			this.profileItems[field]?.length && this.profileItems[field][0][column]
		);
	}

	public onHandleSearch(value: string): void {
		try {
			this.router.navigate(['search', this.archive.archiveId, value], {
				relativeTo: this.route,
			});
		} catch (err) {
			console.error(err);
		}
	}

	toggleShowFullText(): void {
		this.showShortText = !this.showShortText;
	}

	toggleProfileInformation(): void {
		this.showProfileInformation = !this.showProfileInformation;
	}

	public onTagClick(tag): void {
		try {
			this.router.navigate(
				[
					'search-tag',
					this.archive.archiveId,
					`${tag.tagId}`,
					`${tag.tagName}`,
				],
				{
					relativeTo: this.route,
				},
			);
		} catch (err) {
			console.error(err);
		}
	}
}
