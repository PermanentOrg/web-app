import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faUser } from '@fortawesome/free-regular-svg-icons';
import { faScroll, faTimes } from '@fortawesome/free-solid-svg-icons';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { archiveOptions, archiveDescriptions } from '../types/archive-types';

@Component({
  selector: 'pr-archive-type-select-dialog',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './archive-type-select-dialog.component.html',
  styleUrl: './archive-type-select-dialog.component.scss',
})
export class ArchiveTypeSelectDialogComponent {
  public readonly close = faTimes;
  public readonly options = [...archiveOptions];
  public readonly descriptions = { ...archiveDescriptions };
  public readonly icons = {
    'type:myself': faHeart,
    'type:individual': faUser,
    'type:family': faHeart,
    'type:famhist': faScroll,
  };
  constructor(private dialogRef: DialogRef) {}

  public selectType(type: OnboardingTypes): void {
    this.dialogRef.close(type);
  }

  public closeDialog() {
    this.dialogRef.close();
  }
}
