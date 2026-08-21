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

export const LOCATION_QUALIFIER_OPTIONS = [
	{ key: LocationQualifier.Approximate, label: 'Approximate' },
	{ key: LocationQualifier.Uncertain, label: 'Uncertain' },
	{ key: LocationQualifier.Unknown, label: 'Unknown' },
] as const;

/**
 * The legacy columns `convertStelaLocationToLocnVOData` reads addresses out of.
 * They have to go when a place is cleared, or the next read shims the address
 * straight back in from underneath.
 *
 * Coordinates are deliberately absent: a place and its latitude and longitude
 * are separate things in this design, edited by separate controls, so clearing
 * the address here leaves them alone.
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
 * Reads the stored precision as a set of qualifier flags. Substring matching
 * rather than an exact table because the stored vocabulary is mid-change:
 * `approximate` is becoming `approximate-known`, and a place can be both
 * approximate and uncertain. `unknown` is the one value that stands alone, and
 * neither of the other names contains it.
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
	readonly iconGradientId = ICON_GRADIENT_ID;
	readonly qualifierOptions = LOCATION_QUALIFIER_OPTIONS;
	readonly LocationQualifier = LocationQualifier;

	public item: ItemVO;
	public profileItem: ProfileItemVOData;

	/**
	 * The location being edited. Seeded from whatever the item already has so
	 * the dialog opens on the stored values rather than an empty form.
	 */
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

	/** Empties every field and puts the qualifiers back to their default. */
	public clearAll(): void {
		this.location.set(this.clearedLocation());
		this.qualifiers.set({ ...DEFAULT_LOCATION_QUALIFIERS });
		this.savedQualifiers.set(null);
	}

	public cancel(): void {
		this.dialogRef?.close();
	}

	public save(): void {
		// `qualifiers` is what says how sure we are, so the precision read in at
		// open time does not ride back out; it would otherwise still name the
		// qualifier the user just switched off.
		const { locationPrecision, ...location } = this.location();
		this.dialogRef?.close({ location, qualifiers: this.qualifiers() });
	}

	/**
	 * `Unknown` says nothing about the address is known, so it puts the other
	 * qualifiers away and greys the fields out — but leaves what was typed
	 * where it is, so switching it back off returns the form as it was rather
	 * than costing the user their work.
	 */
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

	/**
	 * Empties everything that says where the place is — not only the fields on
	 * show. A geocoded location keeps coordinates and the legacy columns behind
	 * them, and `PrLocationPipe` will happily render a latitude and longitude as
	 * the address of a place the user just cleared.
	 */
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
