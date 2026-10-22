import { Injectable } from '@angular/core';

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
const MILLISECONDS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;
const OFFSET_PATTERN = /([+-])(\d{1,2})(?::(\d{2}))?(?::\d{2})?/;
const EDTF_OFFSET_PATTERN = /^[+-]\d{2}:\d{2}$/;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// No API enumerates ISO 3166-1 codes, so every two-letter pair is tried.
const buildCandidateRegionCodes = (): string[] =>
	LETTERS.flatMap((first) => LETTERS.map((second) => `${first}${second}`));

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
		if (typeof offset !== 'string' || !EDTF_OFFSET_PATTERN.test(offset)) {
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
					this.getOffsetMinutesAtWallClock(option.timezoneId, wallClock) ===
					offsetMinutes,
			);
			if (match) {
				return match.timezoneId;
			}
		}
		return null;
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
	): string | null {
		const timezoneId = this.resolveTimezoneId(value);
		if (!timezoneId) {
			return null;
		}

		const offsetMinutes = this.getOffsetMinutesAtWallClock(
			timezoneId,
			wallClock,
		);
		return offsetMinutes === null
			? null
			: this.formatOffsetMinutes(offsetMinutes);
	}

	// Reads the offset as if the wall clock were UTC, then again at the corrected instant.
	private getOffsetMinutesAtWallClock(
		timezoneId: string,
		wallClock: WallClockDateTime,
	): number | null {
		const wallClockAsUtcMs = this.toUtcMilliseconds(wallClock);
		const approximateOffsetMinutes = this.getOffsetMinutesAtInstant(
			timezoneId,
			new Date(wallClockAsUtcMs),
		);
		if (approximateOffsetMinutes === null) {
			return null;
		}

		return this.getOffsetMinutesAtInstant(
			timezoneId,
			new Date(
				wallClockAsUtcMs - approximateOffsetMinutes * MILLISECONDS_PER_MINUTE,
			),
		);
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
		timeZoneName: 'longOffset' | 'longGeneric' | 'long',
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
		timeZoneName: 'longOffset' | 'longGeneric' | 'long',
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

	private toUtcMilliseconds(wallClock: WallClockDateTime): number {
		// Date.UTC maps years 0-99 into the 1900s, so set the year explicitly.
		const instant = new Date(
			Date.UTC(
				2000,
				wallClock.month - 1,
				wallClock.day,
				wallClock.hour,
				wallClock.minute,
				wallClock.second,
			),
		);
		instant.setUTCFullYear(wallClock.year);
		return instant.getTime();
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
