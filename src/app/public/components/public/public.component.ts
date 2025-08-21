import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import {
	ActivatedRoute,
	Router,
	NavigationStart,
	NavigationEnd,
} from '@angular/router';
import { ArchiveVO, AccountVO } from '@models';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';
import { DeviceService } from '@shared/services/device/device.service';

@Component({
	selector: 'pr-public',
	templateUrl: './public.component.html',
	styleUrls: ['./public.component.scss'],
	standalone: false,
})
export class PublicComponent implements OnInit, OnDestroy {
	@HostBinding('class.for-record') isRecord: boolean;

	bottomBannerVisible = false;

	public account: AccountVO = this.accountService.getAccount();
	public archive: ArchiveVO = this.accountService.getArchive();
	public isLoggedIn = this.accountService.isLoggedIn();

	public publishArchive: ArchiveVO;
	public displayName: string;

	public isSearchFocused = false;
	public isNavigating = false;

	public missing = false;

	routerListener: Subscription;

	constructor(
		private route: ActivatedRoute,
		private accountService: AccountService,
		private router: Router,
		private device: DeviceService,
	) {
		this.routerListener = this.router.events
			.pipe(
				filter(
					(event) =>
						event instanceof NavigationStart || event instanceof NavigationEnd,
				),
			)
			.subscribe((event) => {
				if (event instanceof NavigationStart) {
					this.isNavigating = true;
				} else if (event instanceof NavigationEnd) {
					this.isNavigating = false;
				}
			});
	}

	ngOnInit() {
		const publishedItem = this.route.snapshot.firstChild.data.publishedItem;

		if (!publishedItem) {
			this.missing = true;
			this.publishArchive = null;
			return;
		}

		this.isRecord = !!publishedItem.recordId;
		this.displayName = publishedItem.displayName;

		const hasNavigated =
			!!this.route.snapshot.firstChild.firstChild.firstChild.params.archiveNbr;

		if (!this.isRecord && !hasNavigated) {
			const urlToken =
				this.route.snapshot.firstChild.firstChild.params.publishUrlToken;
			const folder = this.route.snapshot.firstChild.data.publishedItem;
			this.router.navigate([
				'/p',
				urlToken,
				folder.archiveNbr,
				folder.folder_linkId,
			]);
		}

		this.publishArchive =
			this.route.snapshot.firstChild.firstChild.data.archive;
	}

	ngOnDestroy() {
		this.routerListener.unsubscribe();
	}

	hideBottomBanner() {
		this.bottomBannerVisible = false;
	}

	onSignupClick() {
		this.router.navigate(['/auth', 'signup'], {
			queryParams: { eventCategory: 'Publish by url' },
		});
	}

	onArchiveThumbClick() {
		this.router.navigate(['/app', 'private']);
	}

	onMyAccountClick() {
		this.onArchiveThumbClick();
	}

	onSearchBarFocusChange(isFocused: boolean) {
		this.isSearchFocused = isFocused;
	}
}
