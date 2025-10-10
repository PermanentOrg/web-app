import { Location } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { ArchiveVO } from '@models/archive-vo';
import { AccountVO } from '@models/account-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { partition as lodashPartition } from 'lodash';
import { EventService } from '@shared/services/event/event.service';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';

@Component({
	selector: 'pr-onboarding',
	templateUrl: './onboarding.component.html',
	styleUrls: ['./onboarding.component.scss'],
	standalone: false,
})
export class OnboardingComponent implements OnInit {
	public screen: OnboardingScreen = OnboardingScreen.welcomeScreen;
	public currentArchive: ArchiveVO;
	public pendingArchives: ArchiveVO[] = [];
	public selectedPendingArchive: ArchiveVO;
	public useApi: boolean = true;
	public progress: number = 0;
	public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

	public showOnboarding: boolean = false;
	public accountName: string = '';
	public errorMessage: string = '';

	public acceptedInvite: boolean = false;

	public isGlam = false;

	constructor(
		route: ActivatedRoute,
		private location: Location,
		private router: Router,
		private api: ApiService,
		private account: AccountService,
		private detector: ChangeDetectorRef,
		private event: EventService,
		feature: FeatureFlagService,
	) {
		if (route.snapshot.data.onboardingScreen) {
			this.screen = route.snapshot.data.onboardingScreen as OnboardingScreen;
		}

		this.isGlam = feature.isEnabled('glam-onboarding');
	}

	ngOnInit(): void {
		this.accountName = this.account.getAccount().fullName;
		this.account.refreshArchives().then((archives) => {
			const [ownArchives, pendingArchives] = lodashPartition<ArchiveVO>(
				archives,
				(archive) => !archive.status.endsWith('pending'),
			);
			if (ownArchives.length <= 0) {
				this.pendingArchives = pendingArchives;
				this.showOnboarding = true;
				if (this.pendingArchives.length > 0) {
					this.screen = OnboardingScreen.pendingArchives;
				}
			}
		});
		this.event.dispatch({
			entity: 'account',
			action: 'create',
		});
	}

	@HostBinding('class.glam') get glamClass() {
		return this.isGlam;
	}

	public setScreen(screen: OnboardingScreen): void {
		this.screen = screen;
		if (this.selectedPendingArchive) {
			this.selectedPendingArchive = null;
		}
		if (screen === OnboardingScreen.done) {
			if (!this.isGlam && this.acceptedInvite) {
				this.router.navigate(['/app', 'welcome-invitation']);
			}
			if (localStorage.getItem('shareToken')) {
				localStorage.removeItem('shareToken');
				this.router.navigate(['/app', 'shares']);
			} else if (this.isGlam) {
				this.router.navigate(['/app']);
			} else {
				this.router.navigate(['/app', 'welcome']);
			}
		}
	}

	public setNewArchive(archive: ArchiveVO): void {
		this.currentArchive = archive;
		const updateAccount = new AccountVO({
			defaultArchiveId: archive.archiveId,
		});
		this.account.updateAccount(updateAccount).then(() => {
			this.account.setArchive(archive);
			this.api.archive.change(archive).then(() => {
				if (this.selectedPendingArchive) {
					this.acceptedInvite = true;
				}
				this.setScreen(OnboardingScreen.done);
			});
		});
	}

	public setState(state: Partial<OnboardingComponent>): void {
		if (state.pendingArchives) {
			this.pendingArchives = state.pendingArchives;
		}
		if (state.screen) {
			this.screen = state.screen;
		}
		if (state.currentArchive) {
			this.currentArchive = state.currentArchive;
		}
	}

	public getProgressChunkClasses(num: number) {
		return {
			'progress-chunk': true,
			completed: this.progress >= num && !this.isGlam,
			'completed-glam': this.progress >= num && this.isGlam,
		};
	}

	public setProgress(num: number) {
		this.errorMessage = '';
		this.progress = num;
		this.detector.detectChanges();
	}

	public selectArchiveInvitation(archive: ArchiveVO): void {
		this.selectedPendingArchive = archive;
		this.screen = OnboardingScreen.welcomeScreen;
	}
}
