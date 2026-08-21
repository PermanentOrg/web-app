import { Component, Inject, OnInit, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ItemVO, LocnVOData } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import {
	ICON_GRADIENT_ID,
	IconTextInputComponent,
} from '@shared/components/icon-text-input/icon-text-input.component';
import {
	faFlagUsa,
	faHouse,
	faHouseBuilding,
	faInputNumeric,
	faMountainSun,
	faSignsPost,
} from '@fortawesome/pro-regular-svg-icons';

/**
 * The editable parts of a location, in the order the dialog lists them. The
 * keys are the `LocnVOData` fields they map onto.
 */
export const LOCATION_FIELDS = [
	{ key: 'sublocation', label: 'Postal/Delivery Address', icon: faSignsPost },
	{ key: 'city', label: 'City/Town/Village', icon: faHouseBuilding },
	{
		key: 'adminOneName',
		label: 'State/Province/District',
		icon: faMountainSun,
	},
	{ key: 'postalCode', label: 'Postal Code', icon: faInputNumeric },
	{ key: 'country', label: 'Country', icon: faFlagUsa },
] as const satisfies ReadonlyArray<{
	key: keyof LocnVOData;
	label: string;
	// The icon packages carry their own copy of the Font Awesome types, so the
	// icon is typed by example rather than through the core package.
	icon: typeof faHouse;
}>;

export interface UncertainLocationPickerData {
	item?: ItemVO;
	profileItem?: ProfileItemVOData;
}

@Component({
	selector: 'pr-uncertain-location-picker',
	standalone: true,
	imports: [CommonModule, IconTextInputComponent],
	templateUrl: './uncertain-location-picker.component.html',
	styleUrls: ['./uncertain-location-picker.component.scss'],
})
export class UncertainLocationPickerComponent implements OnInit {
	readonly fields = LOCATION_FIELDS;
	readonly nameIcon = faHouse;
	readonly iconGradientId = ICON_GRADIENT_ID;

	public item: ItemVO;
	public profileItem: ProfileItemVOData;

	/**
	 * The location being edited. Seeded from whatever the item already has so
	 * the dialog opens on the stored values rather than an empty form.
	 */
	location = signal<LocnVOData>({});

	constructor(
		@Optional()
		@Inject(DIALOG_DATA)
		public dialogData: UncertainLocationPickerData,
		@Optional() private dialogRef: DialogRef<LocnVOData>,
	) {
		if (this.dialogData) {
			this.item = this.dialogData.item;
			this.profileItem = this.dialogData.profileItem;
		}
	}

	ngOnInit(): void {
		const existing = this.item?.LocnVO ?? this.profileItem?.LocnVOs?.[0];
		if (existing) {
			this.location.set({ ...existing });
		}
	}

	public setField(key: keyof LocnVOData, value: string): void {
		this.location.update((locn) => ({ ...locn, [key]: value }));
	}

	public cancel(): void {
		this.dialogRef?.close();
	}

	public save(): void {
		this.dialogRef?.close(this.location());
	}
}
