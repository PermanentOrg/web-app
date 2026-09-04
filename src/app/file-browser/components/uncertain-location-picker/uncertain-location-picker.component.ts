import {
	Component,
	computed,
	Inject,
	OnInit,
	Optional,
	signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
	DEFAULT_LOCATION_QUALIFIERS,
	ItemVO,
	LocationPrecision,
	LocationQualifier,
	LocationQualifierFlags,
	LocnVOData,
} from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { IconTextInputComponent } from '@shared/components/icon-text-input/icon-text-input.component';
import {
	faFlagUsa,
	faHouse,
	faHouseBuilding,
	faInputNumeric,
	faMountainSun,
	faSignsPost,
} from '@fortawesome/pro-regular-svg-icons';

/** Each key is the `LocnVOData` field that part of the address maps onto. */
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
	// Typed by example: the icon packages ship their own copy of these types,
	// which does not unify with the one the core package exports.
	icon: typeof faHouse;
}>;

export const LOCATION_QUALIFIER_OPTIONS = [
	{ key: LocationQualifier.Approximate, label: 'Approximate' },
	{ key: LocationQualifier.Uncertain, label: 'Uncertain' },
	{ key: LocationQualifier.Unknown, label: 'Unknown' },
] as const;

/**
 * Cleared alongside the visible fields: `convertStelaLocationToLocnVOData`
 * shims an address back out of these. Coordinates are absent on purpose — they
 * are a separate thing, edited by a separate control.
 */
const CLEARED_ALSO = [
	'locality',
	'streetNumber',
	'streetName',
	'adminOneCode',
	'adminTwoName',
	'adminTwoCode',
	'countryCode',
	'geoCodeLookup',
] as const satisfies ReadonlyArray<keyof LocnVOData>;

export interface UncertainLocationPickerData {
	item?: ItemVO;
	profileItem?: ProfileItemVOData;
}

export interface UncertainLocationResult {
	location: LocnVOData;
	qualifiers: LocationQualifierFlags;
}

/**
 * Matches on substrings because the stored vocabulary is mid-change, and a
 * place can be both approximate and uncertain. `unknown` stands alone, and no
 * other name contains it.
 */
const toQualifierFlags = (
	precision: LocationPrecision | undefined,
): LocationQualifierFlags => {
	if (!precision) {
		return { ...DEFAULT_LOCATION_QUALIFIERS };
	}
	if (precision === LocationQualifier.Unknown) {
		return { ...DEFAULT_LOCATION_QUALIFIERS, unknown: true };
	}
	return {
		approximate: precision.includes(LocationQualifier.Approximate),
		uncertain: precision.includes(LocationQualifier.Uncertain),
		unknown: false,
	};
};

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
	readonly qualifierOptions = LOCATION_QUALIFIER_OPTIONS;
	readonly LocationQualifier = LocationQualifier;

	public item: ItemVO;
	public profileItem: ProfileItemVOData;

	location = signal<LocnVOData>({});

	qualifiers = signal<LocationQualifierFlags>({
		...DEFAULT_LOCATION_QUALIFIERS,
	});

	/** What the other qualifiers held before `Unknown` set them aside. */
	savedQualifiers = signal<LocationQualifierFlags | null>(null);

	fieldsDisabled = computed(() => this.qualifiers().unknown);

	constructor(
		@Optional()
		@Inject(DIALOG_DATA)
		public dialogData: UncertainLocationPickerData,
		@Optional() private dialogRef: DialogRef<UncertainLocationResult>,
	) {
		if (this.dialogData) {
			this.item = this.dialogData.item;
			this.profileItem = this.dialogData.profileItem;
		}
	}

	ngOnInit(): void {
		const existing = this.item?.LocnVO ?? this.profileItem?.LocnVOs?.[0];
		if (!existing) {
			return;
		}
		this.location.set({ ...existing });
		this.qualifiers.set(toQualifierFlags(existing.locationPrecision));
	}

	public setField(key: keyof LocnVOData, value: string): void {
		this.location.update((locn) => ({ ...locn, [key]: value }));
	}

	public onQualifierChange(qualifier: LocationQualifier): void {
		if (qualifier === LocationQualifier.Unknown) {
			this.toggleUnknown();
			return;
		}
		this.qualifiers.update((flags) => ({
			...flags,
			[qualifier]: !flags[qualifier],
		}));
	}

	public clearAll(): void {
		this.location.set(this.clearedLocation());
		this.qualifiers.set({ ...DEFAULT_LOCATION_QUALIFIERS });
		this.savedQualifiers.set(null);
	}

	public cancel(): void {
		this.dialogRef?.close();
	}

	public save(): void {
		// `qualifiers` is the record now; the precision read in at open time
		// would still name a qualifier the user may have switched off.
		const { locationPrecision, ...location } = this.location();
		this.dialogRef?.close({ location, qualifiers: this.qualifiers() });
	}

	/** Sets the other qualifiers aside without disturbing what was typed. */
	private toggleUnknown(): void {
		if (this.qualifiers().unknown) {
			this.qualifiers.set(
				this.savedQualifiers() ?? { ...DEFAULT_LOCATION_QUALIFIERS },
			);
			this.savedQualifiers.set(null);
			return;
		}
		this.savedQualifiers.set(this.qualifiers());
		this.qualifiers.set({ ...DEFAULT_LOCATION_QUALIFIERS, unknown: true });
	}

	private clearedLocation(): LocnVOData {
		const cleared: LocnVOData = { ...this.location(), name: '' };
		LOCATION_FIELDS.forEach((field) => {
			cleared[field.key] = '';
		});
		CLEARED_ALSO.forEach((key) => {
			delete cleared[key];
		});
		return cleared;
	}
}
