import { OnDestroy } from '@angular/core';
/* @format */
import { Observable, Subscription } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { reasons, goals } from '../../shared/onboarding-screen';
import { Dialog } from '../../../dialog/dialog.service';
import { ArchiveType } from '../../../models/archive-vo';

type NewArchiveScreen = 'goals' | 'reasons' | 'create';

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

  public archiveType: string;
  public archiveName: string = '';
  public screen: NewArchiveScreen = 'create';
  public loading: boolean = false;
  public selectedGoals: string[] = [];
  public selectedReasons: string[] = [];
  public selectedValue: string = '';
  public name: string = '';
  public goals = goals;
  public reasons = reasons;
  archiveTypeTag: string;

  skipOnboarding: Observable<{ name: string }>;

  subscription: Subscription;

  constructor(
    private api: ApiService,
    private dialog: Dialog,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.progress.emit(0);
    this.subscription = this.accountService.createAccountForMe.subscribe(
      (name) => {
        if (name) {
          this.name = name;
          this.archiveType = 'type.archive.person';
          this.screen = 'goals';
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onBackPress(): void {
    if (this.screen === 'goals') {
      this.screen = 'create';
      this.progress.emit(0);
    } else {
      this.screen = 'goals';
      this.progress.emit(1);
    }
  }

  public setScreen(screen: NewArchiveScreen): void {
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
      ];
      const response = await this.api.archive.create(archive);
      await this.api.account.updateAccountTags(tags, []);
      const createdArchive = response.getArchiveVO();
      this.createdArchive.emit(createdArchive);
    } catch {
      this.loading = false;
      this.error.emit(
        'There was an error creating your new archive. Please try again.'
      );
    }
  }

  public addValues(values: string[], value: string): void {
    if (values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    } else {
      values.push(value);
    }
  }

  public onValueChange(value: { type: ArchiveType; tag: string }): void {
    this.selectedValue = `${value.type}+${value.tag}`;
    this.archiveType = value.type;
    this.archiveTypeTag = value.tag;
  }

  public makeMyArchive(): void {
    this.dialog.open(
      'SkipOnboardingDialogComponent',
      { skipOnboarding: this.skipOnboarding },
      { width: '600px' }
    );
  }

  public skipStep(): void {
    if (this.screen === 'goals') {
      this.screen = 'reasons';
      this.progress.emit(2);
      this.selectedGoals = [];
    } else if (this.screen === 'reasons') {
      this.selectedReasons = [];
      this.onSubmit();
    }
  }
}
