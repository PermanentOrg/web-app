import { Injectable } from '@angular/core';

export interface TimezoneOption {
	/** The tz database identifier, e.g. 'Europe/Bucharest'. Shown as the label
	 * and stored on the record, so what is picked is what is persisted. */
	timezoneId: string;
	offsetLabel: string;
	region: string;
	/** Empty when the engine cannot map zones to countries, or for zones that
	 * belong to no country such as UTC. */
	countryName: string;
	/** Also covers the zone's display name and country, so 'eastern european'
	 * and 'romania' both find Europe/Bucharest. */
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
// The exact shape an EDTF datetime carries, so a stray string cannot be
// mistaken for an offset by the looser pattern above.
const EDTF_OFFSET_PATTERN = /^[+-]\d{2}:\d{2}$/;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ISO 3166-1 alpha-2 is a closed two-letter space, and there is no API that
// enumerates it, so every pair is offered to Intl and the misses discarded.
const buildCandidateRegionCodes = (): string[] =>
	LETTERS.flatMap((first) => LETTERS.map((second) => `${first}${second}`));

@Injectable({
	providedIn: 'root',
})
export class TimezoneService {
	private groupedOptions: TimezoneGroup[] | null = null;
	private optionsByTimezoneId: Map<string, TimezoneOption> | null = null;
	private countryNameByTimezoneId: Map<string, string> | null = null;

	getGroupedOptions(): TimezoneGroup[] {
		this.buildOptionsOnce();
		return this.groupedOptions;
	}

	/**
	 * Accepts anything the backend might send and returns a timezone identifier
	 * the Intl APIs will accept, or null. Intl also canonicalizes casing and
	 * legacy aliases, so 'europe/berlin' resolves to 'Europe/Berlin' and
	 * 'US/Eastern' to 'America/New_York'.
	 */
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

	/**
	 * Intl.supportedValuesOf omits identifiers it still accepts elsewhere (UTC,
	 * Etc/UTC, GMT), so a resolvable identifier missing from the list gets an
	 * option built on the spot rather than being treated as unselectable.
	 */
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

	/**
	 * The first zone whose current offset matches the one given, or null when no
	 * zone sits there today. An offset belongs to many places at once, so this
	 * can only ever be a guess; taking the first identifier in the list makes it
	 * a stable one, so the same offset always infers the same zone.
	 */
	getFirstTimezoneIdForOffset(offset: unknown): string | null {
		if (typeof offset !== 'string' || !EDTF_OFFSET_PATTERN.test(offset)) {
			return null;
		}

		const offsetMinutes = this.parseOffsetMinutes(offset);
		if (offsetMinutes === null) {
			return null;
		}
		const offsetLabel = `GMT${this.formatOffsetMinutes(offsetMinutes)}`;

		this.buildOptionsOnce();
		for (const group of this.groupedOptions) {
			const match = group.options.find(
				(option) => option.offsetLabel === offsetLabel,
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

	/**
	 * The UTC offset a zone was on at a given wall-clock reading, as the
	 * '+HH:MM' an EDTF datetime expects. Returns null when the identifier is
	 * unusable so callers can fall back to their previous behaviour.
	 */
	getOffsetForWallClock(
		value: unknown,
		wallClock: WallClockDateTime,
	): string | null {
		const timezoneId = this.resolveTimezoneId(value);
		if (!timezoneId) {
			return null;
		}

		// A wall-clock reading has no offset yet, so read the offset as if it were
		// UTC, shift by that much, then read again at the corrected instant.
		const wallClockAsUtcMs = this.toUtcMilliseconds(wallClock);
		const approximateOffsetMinutes = this.getOffsetMinutesAtInstant(
			timezoneId,
			new Date(wallClockAsUtcMs),
		);
		if (approximateOffsetMinutes === null) {
			return null;
		}

		const offsetMinutes = this.getOffsetMinutesAtInstant(
			timezoneId,
			new Date(
				wallClockAsUtcMs - approximateOffsetMinutes * MILLISECONDS_PER_MINUTE,
			),
		);
		return offsetMinutes === null
			? null
			: this.formatOffsetMinutes(offsetMinutes);
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
			// Separators are spaced out so 'new york' matches America/New_York.
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

	/**
	 * The tz database knows which country each zone belongs to, and the browser
	 * exposes it the other way round: per region code, which zones it holds.
	 * Inverting that over every ISO region gives the zone's country. Engines
	 * without the API simply leave every country name blank.
	 */
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
			// getTimeZones() is the current form; older engines expose the same
			// data as a timeZones accessor, and some expose neither.
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
		// Zones sitting at zero report a bare 'GMT' rather than an offset.
		if (rawOffsetName === 'GMT') {
			return 0;
		}
		return this.parseOffsetMinutes(rawOffsetName);
	}

	/**
	 * Dates predating standard time report local mean time down to the second
	 * (Africa/Accra reads GMT-00:16:08 in the year 85); EDTF offsets only carry
	 * hours and minutes, so any seconds are dropped.
	 */
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
				new Intl.DateTimeFormat('en-US', { timeZone: timezoneId, timeZoneName })
					.formatToParts(instant)
					.find((part) => part.type === 'timeZoneName')?.value ?? ''
			);
		} catch {
			return '';
		}
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
