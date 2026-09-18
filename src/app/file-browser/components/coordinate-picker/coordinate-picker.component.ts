import { Component, Inject, OnInit, Optional, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { LocnVOData } from '@models';
import { CoordinateMapInputComponent } from '@shared/components/coordinate-map-input/coordinate-map-input.component';
import { DialogFrameComponent } from '@shared/components/dialog-frame/dialog-frame.component';
import {
	Coordinates,
	coordinatesFromLocation,
} from '@shared/utilities/coordinates';

export interface CoordinatePickerData {
	location?: LocnVOData;
}

export interface CoordinatePickerResult {
	location: LocnVOData;
}

@Component({
	selector: 'pr-coordinate-picker',
	standalone: true,
	imports: [CoordinateMapInputComponent, DialogFrameComponent],
	templateUrl: './coordinate-picker.component.html',
	styleUrls: ['./coordinate-picker.component.scss'],
})
export class CoordinatePickerComponent implements OnInit {
	coordinates = signal<Coordinates | null>(null);
	isValid = signal(true);

	private locationBeingEdited: LocnVOData = {};

	constructor(
		@Optional()
		@Inject(DIALOG_DATA)
		public dialogData?: CoordinatePickerData,
		@Optional() private dialogRef?: DialogRef<CoordinatePickerResult>,
	) {}

	ngOnInit(): void {
		const existing = this.dialogData?.location;
		if (!existing) {
			return;
		}
		this.locationBeingEdited = { ...existing };
		this.coordinates.set(coordinatesFromLocation(existing));
	}

	public onValidityChange(isValid: boolean): void {
		this.isValid.set(isValid);
	}

	public cancel(): void {
		this.dialogRef?.close();
	}

	public save(): void {
		if (!this.isValid()) {
			return;
		}
		const coordinates = this.coordinates();
		this.dialogRef?.close({
			location: {
				...this.locationBeingEdited,
				latitude: coordinates?.latitude ?? null,
				longitude: coordinates?.longitude ?? null,
			},
		});
	}
}
