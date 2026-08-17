import { Component, Inject, Optional } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ItemVO } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';

@Component({
	selector: 'pr-uncertain-location-picker',
	templateUrl: './uncertain-location-picker.component.html',
	styleUrls: ['./uncertain-location-picker.component.scss'],
	standalone: false,
})
export class UncertainLocationPickerComponent {
	public item: ItemVO;
	public profileItem: ProfileItemVOData;

	constructor(
		@Optional() @Inject(DIALOG_DATA) public dialogData: any,
		@Optional() private dialogRef: DialogRef,
	) {
		if (this.dialogData) {
			this.item = this.dialogData.item;
			this.profileItem = this.dialogData.profileItem;
		}
	}

	public cancel(): void {
		this.dialogRef?.close();
	}
}
