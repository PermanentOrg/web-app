import { Injectable } from '@angular/core';

export interface TimezoneOption {
	ianaZone: string;
	offset: string;
	label: string;
	abbreviation: string;
}

@Injectable({ providedIn: 'root' })
export class TimezoneService {
	private ianaZoneList: string[] | null = null;

	getIanaZones(): string[] {
		if (this.ianaZoneList) return this.ianaZoneList;

		const supportedValuesOf = (
			Intl as unknown as {
				supportedValuesOf?: (key: string) => string[];
			}
		).supportedValuesOf;

		this.ianaZoneList =
			typeof supportedValuesOf === 'function'
				? supportedValuesOf('timeZone')
				: [];
		return this.ianaZoneList;
	}

	getZones(referenceDate: Date = new Date()): TimezoneOption[] {
		return this.getIanaZones().map((ianaZone) => ({
			ianaZone,
			offset: this.computeOffsetForZone(ianaZone, referenceDate),
			label: this.formatZoneLabel(ianaZone),
			abbreviation: this.getAbbreviationForZone(ianaZone, referenceDate),
		}));
	}

	computeOffsetForZone(ianaZone: string, referenceDate: Date): string {
		if (!ianaZone) return '';
		try {
			const formatter = new Intl.DateTimeFormat('en-US', {
				timeZone: ianaZone,
				timeZoneName: 'longOffset',
			});
			const parts = formatter.formatToParts(referenceDate);
			const timezoneNamePart =
				parts.find((part) => part.type === 'timeZoneName')?.value || '';
			// Pure "GMT" (no sign) is what UTC returns; normalise to GMT+00:00.
			if (timezoneNamePart === 'GMT') return 'GMT+00:00';
			const offsetMatch = timezoneNamePart.match(
				/GMT([+-])(\d{1,2})(?::(\d{2}))?/,
			);
			if (!offsetMatch) return '';
			const sign = offsetMatch[1];
			const hours = offsetMatch[2].padStart(2, '0');
			const minutes = offsetMatch[3] ? offsetMatch[3].padStart(2, '0') : '00';
			return `GMT${sign}${hours}:${minutes}`;
		} catch {
			return '';
		}
	}

	getAbbreviationForZone(ianaZone: string, referenceDate: Date): string {
		if (!ianaZone) return '';
		try {
			const formatter = new Intl.DateTimeFormat('en-US', {
				timeZone: ianaZone,
				timeZoneName: 'short',
			});
			const parts = formatter.formatToParts(referenceDate);
			const abbreviation =
				parts.find((part) => part.type === 'timeZoneName')?.value || '';
			// Some zones return a numeric offset (e.g. "GMT-3") instead of letters —
			// surface it as a UTC offset so the UI still has something readable.
			if (/^GMT[+-]?\d/.test(abbreviation) || abbreviation === 'GMT') {
				const offset = this.computeOffsetForZone(ianaZone, referenceDate);
				return offset ? offset.replace('GMT', 'UTC') : abbreviation;
			}
			return abbreviation;
		} catch {
			return '';
		}
	}

	findZoneByOffset(offset: string, referenceDate: Date): string | null {
		if (!offset) return null;
		const normalisedOffset = this.normaliseOffset(offset);
		if (!normalisedOffset) return null;

		const localZone = this.getLocalZone();
		if (
			localZone &&
			this.computeOffsetForZone(localZone, referenceDate) === normalisedOffset
		) {
			return localZone;
		}

		for (const ianaZone of this.getIanaZones()) {
			if (
				this.computeOffsetForZone(ianaZone, referenceDate) === normalisedOffset
			) {
				return ianaZone;
			}
		}
		return null;
	}

	getLocalZone(): string {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
		} catch {
			return '';
		}
	}

	formatZoneLabel(ianaZone: string): string {
		return ianaZone.replace(/_/g, ' ').replace(/\//g, ' / ');
	}

	private normaliseOffset(offset: string): string {
		if (offset === 'Z') return 'GMT+00:00';
		if (offset.startsWith('GMT')) return offset;
		if (/^[+-]\d{2}:\d{2}$/.test(offset)) return `GMT${offset}`;
		return '';
	}
}
