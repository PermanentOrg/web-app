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
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { MixpanelAction } from '@shared/services/mixpanel/mixpanel.service';
import {
  reasons,
  goals,
  OnboardingTypes,
} from '../../shared/onboarding-screen';
import { Dialog } from '../../../dialog/dialog.service';
import { ArchiveType } from '../../../models/archive-vo';

type NewArchiveScreen = 'goals' | 'reasons' | 'create' | 'start';

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

  public archiveType: string;
  public archiveName: string = '';
  public screen: NewArchiveScreen = 'start';
  public loading: boolean = false;
  public selectedGoals: string[] = [];
  public selectedReasons: string[] = [];
  public selectedValue: string = '';
  public name: string = '';
  public goals = goals;
  public reasons = reasons;
  archiveTypeTag: OnboardingTypes;

  skipOnboarding: Observable<{ name: string }>;

  subscription: Subscription;

  constructor(
    private api: ApiService,
    private dialog: Dialog,
    private accountService: AccountService,
    private analytics: AnalyticsService
  ) {}

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
          this.name = value.name;
          this.archiveType = 'type.archive.person';
          this.archiveTypeTag = OnboardingTypes.myself;
          this.selectedValue = `${this.archiveType}+${this.archiveTypeTag}`;
          this.screen = 'goals';
          this.progress.emit(1);
        }
      }
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
      const archive = new ArchiveVO({
        fullName: this.name,
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

  public onValueChange(value: {
    type: ArchiveType;
    tag: OnboardingTypes;
  }): void {
    this.selectedValue = `${value.type}+${value.tag}`;
    this.archiveType = value.type;
    this.archiveTypeTag = value.tag as OnboardingTypes;
    this.setName(this.archiveTypeTag);
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
    this.dialog.open(
      'SkipOnboardingDialogComponent',
      { skipOnboarding: this.skipOnboarding },
      { width: '600px' }
    );
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
        this.name = this.accountService.getAccount().fullName;
        break;
      default:
        this.name = '';
        break;
    }
  }
}
