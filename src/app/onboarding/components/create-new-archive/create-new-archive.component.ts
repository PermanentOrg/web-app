/* format */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { reasons, goals } from '../../shared/onboarding-screen'
import { Dialog } from '../../../dialog/dialog.service';

type NewArchiveScreen = 'goals' | 'reasons' | 'create';

@Component({
  selector: 'pr-create-new-archive',
  templateUrl: './create-new-archive.component.html',
  styleUrls: ['./create-new-archive.component.scss']
})
export class CreateNewArchiveComponent implements OnInit {
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
  

  constructor(
    private api: ApiService,
    private dialog: Dialog,
  ) {
  }

  ngOnInit(): void {
    this.progress.emit(0);
  }

  public onBackPress(): void {
    if (this.screen === 'goals') {
      this.screen = 'create'
      this.progress.emit(0);
    }
    else {
      this.screen = 'goals'
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
    }
    else {
      this.progress.emit(0);
    }
  }


  public async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const archive = new ArchiveVO({
        fullName: this.name,
        type: this.selectedValue.split('+')[0],
      });
      const tags = [this.selectedValue.split('+')[1], ...this.selectedGoals, ...this.selectedReasons];
      const response = await this.api.archive.create(archive);
      const token = localStorage.getItem('AUTH_TOKEN');
      await this.api.account.updateAccountTags(tags, []);
      const createdArchive = response.getArchiveVO();
      this.createdArchive.emit(createdArchive);
    } catch {
      this.loading = false;
      this.error.emit('There was an error creating your new archive. Please try again.');
    }
  }

  public addValues(values: string[], value: string): void {
    if (values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    } else {
      values.push(value);
    }

  }

  public onValueChange(value: string): void {
    this.selectedValue = value;
  }

  public makeMyArchive(): void {
    this.dialog.open('SkipOnboardingDialogComponent', null, { width: '600px' })
  }

  public skipStep(): void {
    if (this.screen === 'goals') {
      this.screen = 'reasons'
      this.progress.emit(2);
      this.selectedGoals = [];
    }
    else if (this.screen === 'reasons') {
      this.selectedReasons = [];
      this.onSubmit()
    }
  }
}
