import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

export interface TimezoneOption {
	timezoneId: string;
	offsetLabel: string;
	region: string;
	countryName: string;
	searchText: string;
}

export interface TimezoneGroup {
	region: string;
	options: TimezoneOption[];
}

export interface WallClockDateTime {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

const FALLBACK_REGION = 'Other';
const MINUTES_PER_HOUR = 60;
const OFFSET_PATTERN = /([+-])(\d{1,2})(?::(\d{2}))?(?::\d{2})?/;
const EDTF_OFFSET_PATTERN = /^[+-]\d{2}:\d{2}$/;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WALL_CLOCK_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type TimezoneNameStyle = 'longOffset' | 'longGeneric' | 'long';

// No API enumerates ISO 3166-1 codes, so every two-letter pair is tried.
const buildCandidateRegionCodes = (): string[] =>
	LETTERS.flatMap((first) => LETTERS.map((second) => `${first}${second}`));

const isEdtfOffset = (value: unknown): value is string =>
	typeof value === 'string' && EDTF_OFFSET_PATTERN.test(value);

const toMomentInput = (wallClock: WallClockDateTime): number[] => [
	wallClock.year,
	wallClock.month - 1,
	wallClock.day,
	wallClock.hour,
	wallClock.minute,
	wallClock.second,
];

@Injectable({
	providedIn: 'root',
})
export class TimezoneService {
	private groupedOptions: TimezoneGroup[] | null = null;
	private optionsByTimezoneId: Map<string, TimezoneOption> | null = null;
	private countryNameByTimezoneId: Map<string, string> | null = null;
	private readonly timezoneNameFormatters = new Map<
		string,
		Intl.DateTimeFormat
	>();

	getGroupedOptions(): TimezoneGroup[] {
		this.buildOptionsOnce();
		return this.groupedOptions;
	}

	// Intl also canonicalizes casing and aliases, e.g. 'US/Eastern' to 'America/New_York'.
	resolveTimezoneId(value: unknown): string | null {
		if (typeof value !== 'string' || !value.trim()) {
			return null;
		}
		try {
			return new Intl.DateTimeFormat('en-US', {
				timeZone: value.trim(),
			}).resolvedOptions().timeZone;
		} catch {
			return null;
		}
	}

	// supportedValuesOf omits ids Intl still accepts, such as UTC, so those are built on the spot.
	getOption(value: unknown): TimezoneOption | null {
		const timezoneId = this.resolveTimezoneId(value);
		if (!timezoneId) {
			return null;
		}

		this.buildOptionsOnce();
		return (
			this.optionsByTimezoneId.get(timezoneId) ?? this.buildOption(timezoneId)
		);
	}

	// Compared at the record's own date, since zones change offset across DST and history.
	getFirstTimezoneIdForOffset(
		offset: unknown,
		wallClock: WallClockDateTime,
	): string | null {
		if (!isEdtfOffset(offset)) {
			return null;
		}

		const offsetMinutes = this.parseOffsetMinutes(offset);
		if (offsetMinutes === null) {
			return null;
		}

		this.buildOptionsOnce();
		for (const group of this.groupedOptions) {
			const match = group.options.find(
				(option) =>
					this.getOffsetMinutesAtWallClock(
						option.timezoneId,
						wallClock,
						offset,
					) === offsetMinutes,
			);
			if (match) {
				return match.timezoneId;
			}
		}
		return null;
	}

	// Browsers expose only CLDR names ('Israel Time'), never tzdata's own abbreviations ('IDT').
	getAbbreviationForWallClock(
		value: unknown,
		wallClock: WallClockDateTime,
		storedOffset?: unknown,
	): string | null {
		const timezoneId = this.resolveTimezoneId(value);
		if (!timezoneId) {
			return null;
		}

		return (
			this.toZonedMoment(timezoneId, wallClock, storedOffset)?.format('z') ||
			null
		);
	}

	// Written the way tzdata writes a numeric abbreviation: '+03', '+0530'.
	formatOffsetAsAbbreviation(offset: unknown): string | null {
		if (!isEdtfOffset(offset)) {
			return null;
		}
		return offset.replace(':', '').replace(/00$/, '');
	}

	getBrowserTimezoneId(): string | null {
		try {
			return this.resolveTimezoneId(
				Intl.DateTimeFormat().resolvedOptions().timeZone,
			);
		} catch {
			return null;
		}
	}

	getOffsetForWallClock(
		value: unknown,
		wallClock: WallClockDateTime,
		storedOffset?: unknown,
	): string | null {
		const timezoneId = this.resolveTimezoneId(value);
		if (!timezoneId) {
			return null;
		}

		const offsetMinutes = this.getOffsetMinutesAtWallClock(
			timezoneId,
			wallClock,
			storedOffset,
		);
		return offsetMinutes === null
			? null
			: this.formatOffsetMinutes(offsetMinutes);
	}

	// Same tzdata as the abbreviation, so a written offset never contradicts the label next to it.
	// Pre-standard-time offsets carry seconds (-350.6 minutes); EDTF offsets drop them.
	private getOffsetMinutesAtWallClock(
		timezoneId: string,
		wallClock: WallClockDateTime,
		storedOffset: unknown,
	): number | null {
		const zonedMoment = this.toZonedMoment(timezoneId, wallClock, storedOffset);
		return zonedMoment ? Math.trunc(zonedMoment.utcOffset()) : null;
	}

	// moment-timezone resolves a repeated hour to its earlier occurrence.
	private toZonedMoment(
		timezoneId: string,
		wallClock: WallClockDateTime,
		storedOffset: unknown,
	): moment.Moment | null {
		if (!moment.tz.zone(timezoneId)) {
			return null;
		}
		const earlierOccurrence = moment.tz(toMomentInput(wallClock), timezoneId);
		if (!earlierOccurrence.isValid()) {
			return null;
		}
		return (
			this.toOccurrenceAtOffset(timezoneId, wallClock, storedOffset) ??
			earlierOccurrence
		);
	}

	private toOccurrenceAtOffset(
		timezoneId: string,
		wallClock: WallClockDateTime,
		storedOffset: unknown,
	): moment.Moment | null {
		const offsetMinutes = isEdtfOffset(storedOffset)
			? this.parseOffsetMinutes(storedOffset)
			: null;
		if (offsetMinutes === null) {
			return null;
		}
		const wallClockAsUtc = moment.utc(toMomentInput(wallClock));
		const occurrence = wallClockAsUtc
			.clone()
			.subtract(offsetMinutes, 'minutes')
			.tz(timezoneId);
		const isWallClockAtThatOffset =
			occurrence.format(WALL_CLOCK_FORMAT) ===
			wallClockAsUtc.format(WALL_CLOCK_FORMAT);
		return isWallClockAtThatOffset ? occurrence : null;
	}

	private buildOptionsOnce(): void {
		if (this.groupedOptions && this.optionsByTimezoneId) {
			return;
		}

		const optionsByRegion = new Map<string, TimezoneOption[]>();
		this.optionsByTimezoneId = new Map<string, TimezoneOption>();

		for (const timezoneId of this.getSupportedTimezoneIds()) {
			const option = this.buildOption(timezoneId);
			this.optionsByTimezoneId.set(timezoneId, option);

			const regionOptions = optionsByRegion.get(option.region) ?? [];
			regionOptions.push(option);
			optionsByRegion.set(option.region, regionOptions);
		}

		this.groupedOptions = [...optionsByRegion.entries()]
			.map(([region, options]) => ({
				region,
				options: options.sort((left, right) =>
					left.timezoneId.localeCompare(right.timezoneId),
				),
			}))
			.sort((left, right) => left.region.localeCompare(right.region));
	}

	private getSupportedTimezoneIds(): string[] {
		try {
			return Intl.supportedValuesOf('timeZone');
		} catch {
			const browserTimezoneId = this.getBrowserTimezoneId();
			return browserTimezoneId ? [browserTimezoneId] : [];
		}
	}

	private buildOption(timezoneId: string): TimezoneOption {
		const today = new Date();
		const displayName =
			this.extractTimezoneNamePart(timezoneId, 'longGeneric', today) ||
			this.extractTimezoneNamePart(timezoneId, 'long', today);
		const offsetLabel = this.buildOffsetLabel(timezoneId, today);
		const region = timezoneId.includes('/')
			? timezoneId.split('/')[0].replace(/_/g, ' ')
			: FALLBACK_REGION;
		const countryName = this.getCountryName(timezoneId);

		return {
			timezoneId,
			offsetLabel,
			region,
			countryName,
			searchText: [
				timezoneId.replace(/[/_]/g, ' '),
				displayName,
				countryName,
				offsetLabel,
			]
				.join(' ')
				.toLowerCase(),
		};
	}

	private getCountryName(timezoneId: string): string {
		this.buildCountryNamesOnce();
		return this.countryNameByTimezoneId.get(timezoneId) ?? '';
	}

	// Intl only maps regions to zones, so that mapping is inverted over every region code.
	private buildCountryNamesOnce(): void {
		if (this.countryNameByTimezoneId) {
			return;
		}
		this.countryNameByTimezoneId = new Map<string, string>();

		const regionNames = this.createRegionDisplayNames();
		if (!regionNames) {
			return;
		}

		for (const regionCode of buildCandidateRegionCodes()) {
			const countryName = this.resolveCountryName(regionNames, regionCode);
			if (!countryName) {
				continue;
			}
			for (const timezoneId of this.getTimezoneIdsForRegion(regionCode)) {
				if (!this.countryNameByTimezoneId.has(timezoneId)) {
					this.countryNameByTimezoneId.set(timezoneId, countryName);
				}
			}
		}
	}

	private createRegionDisplayNames(): Intl.DisplayNames | null {
		try {
			return new Intl.DisplayNames(['en'], { type: 'region' });
		} catch {
			return null;
		}
	}

	// A code with no translation is not a real region; Intl echoes it back.
	private resolveCountryName(
		regionNames: Intl.DisplayNames,
		regionCode: string,
	): string {
		try {
			const countryName = regionNames.of(regionCode);
			return countryName && countryName !== regionCode ? countryName : '';
		} catch {
			return '';
		}
	}

	private getTimezoneIdsForRegion(regionCode: string): string[] {
		try {
			// Older engines expose a timeZones accessor instead, and some neither.
			const locale = new Intl.Locale(`und-${regionCode}`) as Intl.Locale & {
				getTimeZones?: () => string[] | undefined;
				timeZones?: string[];
			};
			return locale.getTimeZones?.() ?? locale.timeZones ?? [];
		} catch {
			return [];
		}
	}

	private buildOffsetLabel(timezoneId: string, instant: Date): string {
		const offsetMinutes = this.getOffsetMinutesAtInstant(timezoneId, instant);
		return offsetMinutes === null
			? ''
			: `GMT${this.formatOffsetMinutes(offsetMinutes)}`;
	}

	private getOffsetMinutesAtInstant(
		timezoneId: string,
		instant: Date,
	): number | null {
		const rawOffsetName = this.extractTimezoneNamePart(
			timezoneId,
			'longOffset',
			instant,
		);
		if (!rawOffsetName) {
			return null;
		}
		if (rawOffsetName === 'GMT') {
			return 0;
		}
		return this.parseOffsetMinutes(rawOffsetName);
	}

	// Pre-standard-time dates can report seconds (GMT-00:16:08); EDTF offsets drop them.
	private parseOffsetMinutes(timezoneName: string): number | null {
		const offsetMatch = OFFSET_PATTERN.exec(timezoneName);
		if (!offsetMatch) {
			return null;
		}
		const [, sign, hours, minutes] = offsetMatch;
		const totalMinutes =
			Number(hours) * MINUTES_PER_HOUR + Number(minutes ?? 0);
		return sign === '-' ? -totalMinutes : totalMinutes;
	}

	private extractTimezoneNamePart(
		timezoneId: string,
		timeZoneName: TimezoneNameStyle,
		instant: Date,
	): string {
		try {
			return (
				this.getTimezoneNameFormatter(timezoneId, timeZoneName)
					.formatToParts(instant)
					.find((part) => part.type === 'timeZoneName')?.value ?? ''
			);
		} catch {
			return '';
		}
	}

	private getTimezoneNameFormatter(
		timezoneId: string,
		timeZoneName: TimezoneNameStyle,
	): Intl.DateTimeFormat {
		const cacheKey = `${timezoneId}|${timeZoneName}`;
		let formatter = this.timezoneNameFormatters.get(cacheKey);
		if (!formatter) {
			formatter = new Intl.DateTimeFormat('en-US', {
				timeZone: timezoneId,
				timeZoneName,
			});
			this.timezoneNameFormatters.set(cacheKey, formatter);
		}
		return formatter;
	}

	private formatOffsetMinutes(offsetMinutes: number): string {
		const sign = offsetMinutes < 0 ? '-' : '+';
		const absoluteMinutes = Math.abs(offsetMinutes);
		const hours = String(
			Math.floor(absoluteMinutes / MINUTES_PER_HOUR),
		).padStart(2, '0');
		const minutes = String(absoluteMinutes % MINUTES_PER_HOUR).padStart(2, '0');
		return `${sign}${hours}:${minutes}`;
	}
}
