import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { archiveOptions, archiveDescriptions } from '../types/archive-types';

@Component({
  selector: 'pr-archive-type-select-dialog',
  standalone: true,
  imports: [],
  templateUrl: './archive-type-select-dialog.component.html',
  styleUrl: './archive-type-select-dialog.component.scss',
})
export class ArchiveTypeSelectDialogComponent {
  public readonly options = [...archiveOptions];
  constructor(private dialogRef: DialogRef) {}

  public selectType(type: OnboardingTypes): void {
    this.dialogRef.close(type);
  }
}
