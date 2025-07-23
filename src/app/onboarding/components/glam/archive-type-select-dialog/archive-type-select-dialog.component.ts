import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { archiveOptions, archiveDescriptions } from '../types/archive-types';
import { ArchiveTypeIconComponent } from '../archive-type-icon/archive-type-icon.component';

@Component({
	selector: 'pr-archive-type-select-dialog',
	imports: [FontAwesomeModule, ArchiveTypeIconComponent],
	templateUrl: './archive-type-select-dialog.component.html',
	styleUrl: './archive-type-select-dialog.component.scss',
})
export class ArchiveTypeSelectDialogComponent {
	public readonly close = faTimes;
	public readonly options = [...archiveOptions];
	public readonly descriptions = { ...archiveDescriptions };
	constructor(private dialogRef: DialogRef) {}

	public selectType(type: OnboardingTypes): void {
		this.dialogRef.close(type);
	}

	public closeDialog() {
		this.dialogRef.close();
	}
}
