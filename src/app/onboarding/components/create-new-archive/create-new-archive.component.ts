import { Observable, Subscription } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ArchiveType, ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { EventService } from '@shared/services/event/event.service';
import { AccountEventAction } from '@shared/services/event/event-types';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { SkipOnboardingDialogComponent } from '@core/components/skip-onboarding-dialog/skip-onboarding-dialog.component';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import {
	reasons,
	goals,
	OnboardingTypes,
	NewArchiveScreen,
} from '../../shared/onboarding-screen';
import {
	archiveOptions,
	ArchiveCreateEvent,
} from '../glam/types/archive-types';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
	selector: 'pr-create-new-archive',
	templateUrl: './create-new-archive.component.html',
	styleUrls: ['./create-new-archive.component.scss'],
	standalone: false,
})
export class CreateNewArchiveComponent implements OnInit {
	@Output() back = new EventEmitter<void>();
	@Output() createdArchive = new EventEmitter<ArchiveVO>();
	@Output() errorOccurred = new EventEmitter<string>();
	@Output() progressUpdated = new EventEmitter<number>();
	@Output() chartPathClicked = new EventEmitter<void>();
	@Output() backToPendingArchivesOutput = new EventEmitter<void>();
	@Input() pendingArchives: ArchiveVO[] = [];
	@Input() pendingArchive: ArchiveVO;

	private actionsForScreen: { [key: string]: AccountEventAction } = {
		goals: 'skip_goals',
		reasons: 'skip_why_permanent',
	};

	public archiveType: string;
	public archiveName: string = '';
	public screen: NewArchiveScreen = 'start';
	public loading: boolean = false;
	public isArchiveSubmitted: boolean = false;
	public selectedGoals: string[] = [];
	public selectedReasons: string[] = [];
	public selectedValue: string = '';
	public nameForm: UntypedFormGroup;
	public goals = goals;
	public reasons = reasons;
	public headerText = 'Personal';
	archiveTypeTag: OnboardingTypes;
	public buttonOptions = {
		archiveType: 'Personal',
		article: 'a',
	};

	public isGlam = false;

	public name = '';

	public buttonText = '';

	skipOnboarding: Observable<{ name: string }>;

	subscription: Subscription;

	constructor(
		private fb: UntypedFormBuilder,
		private api: ApiService,
		private dialog: DialogCdkService,
		private accountService: AccountService,
		private event: EventService,
		private onboardingService: OnboardingService,
		feature: FeatureFlagService,
	) {
		this.isGlam = feature.isEnabled('glam-onboarding');
		if (!this.isGlam) {
			this.screen = 'create';
		}

		const screen = this.onboardingService.getOnboardingScreen();
		if (screen) {
			this.screen = screen;
		} else {
			this.onboardingService.setOnboardingScreen(this.screen);
		}
	}

	ngOnInit(): void {
		if (this.pendingArchives.length && !this.pendingArchive) {
			this.screen = 'create';
		}

		if (this.pendingArchive) {
			this.screen = 'goals';
			this.progressUpdated.emit(1);
		} else {
			this.progressUpdated.emit(0);
		}
		this.progressUpdated.emit(0);
		this.event.dispatch({
			entity: 'account',
			action: 'start_onboarding',
		});

		const storageGoals = this.onboardingService.getGoals();
		if (storageGoals.length) {
			this.selectedGoals = storageGoals;
		}

		const storageReasons = this.onboardingService.getReasons();
		if (storageReasons.length) {
			this.selectedReasons = storageReasons;
		}

		const storageName = this.onboardingService.getArchiveName();
		if (storageName) {
			this.name = storageName;
		}

		const storageType = this.onboardingService.getArchiveType();
		if (storageType) {
			this.archiveType = storageType;
		}
	}

	public onBackPress(): void {
		if (this.pendingArchive) {
			this.goToInvitations();
		}
		if (this.screen === 'goals') {
			this.screen = 'create';
			this.progressUpdated.emit(0);
		} else {
			this.screen = 'goals';
			this.progressUpdated.emit(1);
		}
		this.onboardingService.setOnboardingScreen(this.screen);
	}

	public setScreen(screen: NewArchiveScreen): void {
		if (
			(this.pendingArchive || this.pendingArchives.length) &&
			(screen === 'create' || screen === 'name-archive' || screen === 'start')
		) {
			this.goToInvitations();
		}
		const action = screen === 'reasons' ? 'submit_reasons' : 'submit_goals';
		this.event.dispatch({
			entity: 'account',
			action,
		});
		this.screen = screen;
		this.onboardingService.setOnboardingScreen(screen);
		if (screen === 'reasons') {
			this.progressUpdated.emit(2);
			this.chartPathClicked.emit();
		} else if (screen === 'goals') {
			this.progressUpdated.emit(1);
		} else {
			this.progressUpdated.emit(0);
		}
	}

	public async onSubmit(): Promise<void> {
		try {
			this.loading = true;
			this.isArchiveSubmitted = true;
			const fullName = this.name;
			const archive = new ArchiveVO({
				fullName,
				type: this.archiveType,
			});

			const tags = [
				this.archiveTypeTag,
				...this.selectedGoals,
				...this.selectedReasons,
			].filter((tag) => !!tag);

			let createdArchive: ArchiveVO;
			let acceptedPendingArchive = false;

			try {
				let response;

				if (this.pendingArchive) {
					if (!this.isGlam) {
						await this.api.archive.accept(this.pendingArchive);
					}
					acceptedPendingArchive = true;
				} else {
					response = await this.api.archive.create(archive);
					createdArchive = response.getArchiveVO();
				}

				const shareToken =
					localStorage.getItem('shareToken') ||
					localStorage.getItem('shareTokenFromCopy');
				if (shareToken) {
					await this.api.share.requestShareAccess(shareToken);
				}
			} catch (archiveError) {
				this.errorOccurred.emit('An error occurred. Please try again.');
			}

			try {
				await this.api.account.updateAccountTags(tags, []);
			} catch (tagsError) {}

			if (createdArchive) {
				this.createdArchive.emit(createdArchive);
			}
			if (acceptedPendingArchive) {
				this.createdArchive.emit(this.pendingArchive);
			}
			if (createdArchive || acceptedPendingArchive) {
				this.onboardingService.clearSessionStorage();
			}
		} catch (error) {
			this.errorOccurred.emit('An error occurred. Please try again.');
		} finally {
			this.loading = false;
		}
	}

	public addValues(values: string[], value: string): void {
		if (values.includes(value)) {
			values.splice(values.indexOf(value), 1);
		} else {
			values.push(value);
		}
	}

	public makeMyArchive(): void {
		this.event.dispatch({
			entity: 'account',
			action: 'skip_create_archive',
		});
		if (this.isGlam) {
			this.screen = 'create-archive-for-me';
		} else {
			this.dialog
				.open(SkipOnboardingDialogComponent, {
					data: { skipOnboarding: this.skipOnboarding },
					width: '600px',
				})
				.closed.subscribe((result: { action: string; name: string }) => {
					if (result.action === 'confirm') {
						this.name = result.name;
						this.archiveType = 'type.archive.person';
						this.archiveTypeTag = OnboardingTypes.myself;
						this.selectedValue = `${this.archiveType}+${this.archiveTypeTag}`;
						this.screen = 'goals';
						this.progressUpdated.emit(1);
					}
				});
		}
	}

	public skipStep(): void {
		const action = this.actionsForScreen[this.screen];
		if (action) {
			this.event.dispatch({
				entity: 'account',
				action,
			});
		}
		if (this.screen === 'goals') {
			this.screen = 'reasons';
			this.progressUpdated.emit(2);
			this.onboardingService.setOnboardingScreen(this.screen);
			this.selectedGoals = [];
		} else if (this.screen === 'reasons') {
			this.selectedReasons = [];
			this.onSubmit();
			this.onboardingService.removeOnboardingScreen();
		}
	}

	goToInvitations(): void {
		this.back.emit();
	}

	private setName(archiveTypeTag: OnboardingTypes): void {
		switch (archiveTypeTag) {
			case OnboardingTypes.unsure: {
				const name = this.accountService.getAccount()?.fullName;
				this.name = name;
				this.onboardingService.setArchiveName(name);
				break;
			}
			default:
				this.name = '';
				break;
		}
	}

	public getArchiveType = (type: string): string =>
		archiveOptions.find((val) => val.type === type).text;

	public navigate(event): void {
		this.screen = event;
	}

	public handleCreationScreenEvents(event: Record<string, string>): void {
		this.archiveTypeTag = event.tag as OnboardingTypes;
		this.archiveType = event.type;
		this.onboardingService.setArchiveType(this.archiveType);
		this.onboardingService.setArchiveTypeTag(this.archiveTypeTag);
		this.headerText = event.headerText;
		this.setScreen(event.screen as NewArchiveScreen);
	}

	public onValueChange(value: {
		type: ArchiveType;
		tag: OnboardingTypes;
	}): void {
		this.selectedValue = `${value.type}+${value.tag}`;
		this.archiveType = value.type;
		this.archiveTypeTag = value.tag as OnboardingTypes;
		this.setName(this.archiveTypeTag);
	}

	public navigateToGoals(event: string) {
		this.name = event;
		this.onboardingService.setArchiveName(this.name);
		this.setScreen('goals');
	}

	public navToGoals(event: ArchiveCreateEvent): void {
		this.name = event.name;
		this.archiveType = event.type;
		this.archiveTypeTag = OnboardingTypes.myself;
		this.setScreen('goals');
	}

	public handleGoalsNav(event): void {
		this.selectedGoals = event.goals;
		this.setScreen(event.screen);
	}

	public handleReasonsEmit(event): void {
		this.selectedReasons = event.reasons;
		this.setScreen(event.screen as NewArchiveScreen);
	}
}
