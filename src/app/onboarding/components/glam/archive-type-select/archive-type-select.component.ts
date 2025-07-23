import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { ArchiveTypeSelectDialogComponent } from '../archive-type-select-dialog/archive-type-select-dialog.component';
import { archiveOptions, archiveDescriptions } from '../types/archive-types';
import { ArchiveTypeIconComponent } from '../archive-type-icon/archive-type-icon.component';

@Component({
	selector: 'pr-glam-archive-type-select',
	imports: [FontAwesomeModule, ArchiveTypeIconComponent],
	templateUrl: './archive-type-select.component.html',
	styleUrl: './archive-type-select.component.scss',
})
export class GlamArchiveTypeSelectComponent implements OnInit {
	@Output() public typeSelected = new EventEmitter<OnboardingTypes>();
	@Input() currentType: OnboardingTypes = OnboardingTypes.myself;
	public typeName: string;
	public typeDescription: string;
	public chevronDown = faChevronDown;

	constructor(private dialog: DialogCdkService) {
		this.refreshArchiveTypeText();
	}

	ngOnInit(): void {
		if (this.currentType) {
			this.refreshArchiveTypeText();
		}
	}

	public onClick(): void {
		this.dialog
			.open(ArchiveTypeSelectDialogComponent, {
				panelClass: 'dialog',
			})
			.closed.subscribe((value?: OnboardingTypes) => {
				if (value) {
					if (!this.getOptionByType(value)) {
						return;
					}
					this.currentType = value;
					this.refreshArchiveTypeText();
					this.typeSelected.emit(value);
				}
			});
	}

	private getOptionByType(value: OnboardingTypes) {
		return archiveOptions.find((val) => val.type === value);
	}

	private refreshArchiveTypeText(): void {
		this.typeName = this.getOptionByType(this.currentType).text;
		this.typeDescription = archiveDescriptions[this.currentType];
	}
}
