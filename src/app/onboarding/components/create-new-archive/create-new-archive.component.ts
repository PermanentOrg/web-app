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
} from '../../shared/onboarding-screen';
import {
	archiveOptions,
	ArchiveCreateEvent,
} from '../glam/types/archive-types';
import { OnboardingService } from '../../services/onboarding.service';

type NewArchiveScreen =
	| 'goals'
	| 'reasons'
	| 'create'
	| 'start'
	| 'name-archive'
	| 'create-archive-for-me'
	| 'finalize';

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

		const screen = sessionStorage.getItem('onboardingScreen');
		if (screen) {
			this.screen = screen as NewArchiveScreen;
		} else {
			sessionStorage.setItem('onboardingScreen', this.screen);
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

		const storageGoals = sessionStorage.getItem('goals');
		if (storageGoals) {
			this.selectedGoals = JSON.parse(storageGoals);
		}

		const storageReasons = sessionStorage.getItem('reasons');
		if (storageReasons) {
			this.selectedReasons = JSON.parse(storageReasons);
		}

		const storageName = sessionStorage.getItem('archiveName');
		if (storageName) {
			this.name = storageName;
		}

		const storageType = sessionStorage.getItem('archiveType');
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
		sessionStorage.setItem('onboardingScreen', this.screen);
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
		sessionStorage.setItem('onboardingScreen', screen);
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

			try {
				let response;

				if (this.pendingArchive) {
					if (!this.isGlam) {
						await this.api.archive.accept(this.pendingArchive);
					}
				} else {
					response = await this.api.archive.create(archive);
					createdArchive = response.getArchiveVO();
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
			if (this.pendingArchive) {
				this.createdArchive.emit(this.pendingArchive);
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
			sessionStorage.setItem('onboardingScreen', this.screen);
			this.selectedGoals = [];
		} else if (this.screen === 'reasons') {
			this.selectedReasons = [];
			this.onSubmit();
			sessionStorage.removeItem('onboardingScreen');
		}
	}

	goToInvitations(): void {
		this.back.emit();
	}

	private setName(archiveTypeTag: OnboardingTypes): void {
		switch (archiveTypeTag) {
			case OnboardingTypes.unsure:
				const name = this.accountService.getAccount()?.fullName;
				this.name = name;
				sessionStorage.setItem('archiveName', name);
				break;
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
		sessionStorage.setItem('archiveType', this.archiveType);
		sessionStorage.setItem('archiveTypeTag', this.archiveTypeTag);
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
		sessionStorage.setItem('archiveName', this.name);
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

	private clearSessionStorage(): void {
		sessionStorage.removeItem('goals');
		sessionStorage.removeItem('reasons');
		sessionStorage.removeItem('archiveName');
		sessionStorage.removeItem('archiveType');
		sessionStorage.removeItem('archiveTypeTag');
	}
}
