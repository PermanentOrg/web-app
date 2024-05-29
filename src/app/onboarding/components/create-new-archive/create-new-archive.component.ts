/* @format */
import { Observable, Subscription } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  Input,
} from '@angular/core';
import { ArchiveType, ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { MixpanelAction } from '@shared/services/mixpanel/mixpanel.service';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  reasons,
  goals,
  OnboardingTypes,
} from '../../shared/onboarding-screen';
import { Dialog } from '../../../dialog/dialog.service';
import { archiveOptions } from '../glam/types/archive-types';
import { generateElementText } from '../../utils/utils';

type NewArchiveScreen =
  | 'goals'
  | 'reasons'
  | 'create'
  | 'start'
  | 'name-archive'
  | 'create-archive-for-me';

@Component({
  selector: 'pr-create-new-archive',
  templateUrl: './create-new-archive.component.html',
  styleUrls: ['./create-new-archive.component.scss'],
})
export class CreateNewArchiveComponent implements OnInit, OnDestroy {
  @Output() back = new EventEmitter<void>();
  @Output() createdArchive = new EventEmitter<ArchiveVO>();
  @Output() error = new EventEmitter<string>();
  @Output() progress = new EventEmitter<number>();
  @Output() chartPathClicked = new EventEmitter<void>();
  @Input() pendingArchives: ArchiveVO[] = [];
  @Input() pendingArchive: ArchiveVO;

  private mixpanelActions: { [key: string]: MixpanelAction } = {
    goals: 'skip_goals',
    reasons: 'skip_why_permanent',
  };

  public omittedScreens = [
    'start',
    'create',
    'name-archive',
    'create-archive-for-me',
  ];
  public archiveType: string;
  public archiveName: string = '';
  public screen: NewArchiveScreen = 'start';
  public loading: boolean = false;
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
    private dialog: Dialog,
    private accountService: AccountService,
    private analytics: AnalyticsService,
  ) {
    this.nameForm = fb.group({
      name: ['', [Validators.required]],
    });
    this.isGlam = localStorage.getItem('isGlam') === 'true';
    if (!this.isGlam) {
      this.screen = 'create';
    }
  }

  ngOnInit(): void {
    if (this.pendingArchive) {
      this.screen = 'goals';
      this.progress.emit(1);
    } else {
      this.progress.emit(0);
    }
    this.subscription = this.accountService.createAccountForMe.subscribe(
      (value) => {
        if (value.action === 'confirm') {
          this.nameForm.patchValue({ name: value.name });
          this.archiveType = 'type.archive.person';
          this.archiveTypeTag = OnboardingTypes.myself;
          this.selectedValue = `${this.archiveType}+${this.archiveTypeTag}`;
          this.screen = 'goals';
          this.progress.emit(1);
        }
      },
    );
    this.buttonText = generateElementText(
      OnboardingTypes.myself,
      archiveOptions,
    );
    this.progress.emit(0);
    const account = this.accountService.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: 'start_onboarding',
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event: 'Onboarding: start',
          data: {},
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onBackPress(): void {
    if (this.pendingArchive) {
      this.goToInvitations();
    }
    if (this.screen === 'goals') {
      this.screen = 'create';
      this.progress.emit(0);
    } else {
      this.screen = 'goals';
      this.progress.emit(1);
    }
  }

  public setScreen(screen: NewArchiveScreen): void {
    if (this.pendingArchive && screen === 'create') {
      this.goToInvitations();
    }
    const account = this.accountService.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: ('submit_' + screen) as MixpanelAction,
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event: 'Onboarding: ' + screen,
          data: {},
        },
      },
    });
    this.screen = screen;
    if (screen === 'reasons') {
      this.progress.emit(2);
      this.chartPathClicked.emit();
    } else if (screen === 'goals') {
      this.progress.emit(1);
    } else {
      this.progress.emit(0);
    }
  }

  public async onSubmit(): Promise<void> {
    try {
      this.loading = true;
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
          await this.api.archive.accept(this.pendingArchive);
        } else {
          response = await this.api.archive.create(archive);
          createdArchive = response.getArchiveVO();
        }
      } catch (archiveError) {
        this.error.emit('An error occurred. Please try again.');
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
      this.error.emit('An error occurred. Please try again.');
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
    const account = this.accountService.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: 'skip_create_archive',
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event: 'Skip Create Archive',
          data: {},
        },
      },
    });
    if (!this.isGlam) {
      this.dialog.open(
        'SkipOnboardingDialogComponent',
        { skipOnboarding: this.skipOnboarding },
        { width: '600px' },
      );
    } else {
      this.screen = 'create-archive-for-me';
    }
  }

  public navToGoals(event: Record<string, string>): void {
    this.name = event.name;
    this.archiveType = event.type;
    this.archiveTypeTag = OnboardingTypes.myself;
    this.screen = 'goals';
  }

  public skipStep(): void {
    const account = this.accountService.getAccount();
    const event = this.screen === 'goals' ? 'Skip goals' : 'Skip why permanent';
    this.analytics.notifyObservers({
      entity: 'account',
      action: this.mixpanelActions[this.screen],
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event,
          data: {},
        },
      },
    });
    if (this.screen === 'goals') {
      this.screen = 'reasons';
      this.progress.emit(2);
      this.selectedGoals = [];
    } else if (this.screen === 'reasons') {
      this.selectedReasons = [];
      this.onSubmit();
    }
  }

  goToInvitations(): void {
    this.back.emit();
  }

  private setName(archiveTypeTag: OnboardingTypes): void {
    switch (archiveTypeTag) {
      case OnboardingTypes.unsure:
        const name = this.accountService.getAccount().fullName;
        this.name = name;
        break;
      default:
        this.nameForm.patchValue({ name: '' });
        break;
    }
  }

  public getArchiveType = (type: string): string => {
    return archiveOptions.find((val) => val.type === type).text;
  };

  public navigate(event): void {
    this.screen = event;
  }

  public handleCreationScreenEvents(event: Record<string, string>): void {
    this.archiveTypeTag = event.tag as OnboardingTypes;
    this.archiveType = event.type;
    this.headerText = event.headerText;
    this.screen = 'name-archive';
  }

  public navigateToGoals(event: string) {
    this.name = event;
    this.screen = 'goals';
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
}
