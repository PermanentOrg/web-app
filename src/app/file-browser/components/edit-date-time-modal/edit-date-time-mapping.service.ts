import { Injectable } from '@angular/core';
import { Meridian } from '@shared/components/timepicker-input/timepicker-input.component';
import {
	EditDateModel,
	DateObject,
	TimeObject,
	DateQualifierObject,
} from './edit-date-time.model';

@Injectable({ providedIn: 'root' })
export class EditDateTimeMappingService {
	static to12Hour(hour24: number): { hours: string; amPm: Meridian } {
		if (hour24 === 0) {
			return { hours: '12', amPm: Meridian.AM };
		}
		if (hour24 < 12) {
			return { hours: String(hour24).padStart(2, '0'), amPm: Meridian.AM };
		}
		if (hour24 === 12) {
			return { hours: '12', amPm: Meridian.PM };
		}
		return { hours: String(hour24 - 12).padStart(2, '0'), amPm: Meridian.PM };
	}

	static to24Hour(hour12: number, amPm: Meridian): number {
		if (amPm === Meridian.AM) return hour12 === 12 ? 0 : hour12;
		return hour12 === 12 ? 12 : hour12 + 12;
	}

	private static readonly OFFSET_ABBREVIATIONS: Record<string, string> = {
		'GMT-12:00': 'IDLW',
		'GMT-11:00': 'SST',
		'GMT-10:00': 'HST',
		'GMT-09:00': 'AKST',
		'GMT-08:00': 'PST',
		'GMT-07:00': 'MST',
		'GMT-06:00': 'CST',
		'GMT-05:00': 'EST',
		'GMT-04:00': 'AST',
		'GMT-03:30': 'NST',
		'GMT-03:00': 'ART',
		'GMT+00:00': 'GMT',
		'GMT+01:00': 'CET',
		'GMT+02:00': 'EET',
		'GMT+03:00': 'MSK',
		'GMT+03:30': 'IRST',
		'GMT+04:00': 'GST',
		'GMT+04:30': 'AFT',
		'GMT+05:00': 'PKT',
		'GMT+05:30': 'IST',
		'GMT+05:45': 'NPT',
		'GMT+06:00': 'BST',
		'GMT+07:00': 'ICT',
		'GMT+08:00': 'HKT',
		'GMT+09:00': 'JST',
		'GMT+09:30': 'ACST',
		'GMT+10:00': 'AEST',
		'GMT+11:00': 'SBT',
		'GMT+12:00': 'NZST',
		'GMT+13:00': 'TOT',
	};

	static offsetToAbbreviation(offset: string): string {
		if (EditDateTimeMappingService.OFFSET_ABBREVIATIONS[offset]) {
			return EditDateTimeMappingService.OFFSET_ABBREVIATIONS[offset];
		}

		const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
		if (!match) return offset;
		const sign = match[1];
		const hrs = parseInt(match[2], 10);
		const mins = parseInt(match[3], 10);
		return mins === 0
			? `UTC${sign}${hrs}`
			: `UTC${sign}${hrs}:${String(mins).padStart(2, '0')}`;
	}

	static buildTimeString(time: {
		hours: string;
		minutes: string;
		amPm: Meridian;
	}): string {
		if (!time.hours) return '';
		const hour12 = parseInt(time.hours, 10);
		const hour24 = EditDateTimeMappingService.to24Hour(hour12, time.amPm);
		const hours24 = String(hour24).padStart(2, '0');
		const parts = [hours24, time.minutes].filter(Boolean);
		return parts.length > 1 ? parts.join(':') : '';
	}

	static qualifierSuffix(qualifiers?: DateQualifierObject): string {
		if (!qualifiers) return '';
		if (qualifiers.approximate && qualifiers.uncertain) return '%';
		if (qualifiers.approximate) return '~';
		if (qualifiers.uncertain) return '?';
		return '';
	}

	/**
	 * Parses an EDTF string into an EditDateModel.
	 *
	 * Supported formats (start portion only — range end is ignored):
	 *   YYYY, YYYY-MM, YYYY-MM-DD
	 *   YYYY-MM-DDTHH:MM, YYYY-MM-DDTHH:MM:SS
	 *   Trailing qualifiers (?, ~, %) are detected and returned.
	 *   Range separator (/) — only the start portion is parsed.
	 *   "xxxx-xx-xx" (unknown) returns null.
	 */
	static parseEdtf(edtf: string): EditDateModel | null {
		if (!edtf || edtf === 'xxxx-xx-xx') {
			return null;
		}

		// Take only the start portion of a range
		const startPart = edtf.split('/')[0];

		// Detect trailing qualifiers before stripping
		const qualifiers: DateQualifierObject = {
			approximate: false,
			uncertain: false,
			unknown: false,
		};
		const qualifierMatch = startPart.match(/[?~%]+$/);
		if (qualifierMatch) {
			const chars = qualifierMatch[0];
			if (chars.includes('%')) {
				qualifiers.approximate = true;
				qualifiers.uncertain = true;
			} else {
				qualifiers.approximate = chars.includes('~');
				qualifiers.uncertain = chars.includes('?');
			}
		}

		// Strip trailing qualifiers (?, ~, %): e.g. "2026-02-18?~" → "2026-02-18"
		const cleaned = startPart.replace(/[?~%]+$/, '');

		// Split date and time on 'T'
		const [datePart, timePart] = cleaned.split('T');

		// Parse date segments
		const dateSegments = datePart.split('-');
		const year = dateSegments[0] || '';
		const month = dateSegments[1] || '';
		const day = dateSegments[2] || '';

		// Parse time segments (24h format → 12h) and timezone
		let hours = '';
		let minutes = '';
		let amPm = Meridian.AM;
		let timezoneOffset = '';
		let timezoneName = '';

		if (timePart) {
			// Extract timezone from Z+offset suffix (e.g. "14:30:45.123Z+5")
			const zMatch = timePart.match(/Z([+-]\d{1,2}(?::\d{2})?)$/);
			if (zMatch) {
				const tzParts = zMatch[1].match(
					/^([+-])(\d{1,2})(?::(\d{2}))?$/,
				);
				if (tzParts) {
					const sign = tzParts[1];
					const hrs = tzParts[2].padStart(2, '0');
					const mins = tzParts[3] || '00';
					timezoneOffset = `GMT${sign}${hrs}:${mins}`;
					timezoneName =
						EditDateTimeMappingService.offsetToAbbreviation(
							timezoneOffset,
						);
				}
			}

			// Strip Z and everything after it for clean time parsing
			const cleanTimePart = timePart.replace(/Z.*$/, '');
			const timeSegments = cleanTimePart.split(':');
			const hour24 = parseInt(timeSegments[0], 10);

			if (!isNaN(hour24)) {
				const converted = EditDateTimeMappingService.to12Hour(hour24);
				hours = converted.hours;
				amPm = converted.amPm;
			}

			minutes = timeSegments[1] || '';
		}

		return {
			qualifiers,
			date: { year, month, day },
			time: {
				hours,
				minutes,
				seconds: '',
				amPm,
				timezoneOffset,
				timezoneName,
			},
		};
	}

	static buildEdtf(
		date: DateObject,
		time: TimeObject,
		qualifiers?: DateQualifierObject,
	): string {
		let edtf = [date.year, date.month, date.day].filter(Boolean).join('-');

		const timePart = EditDateTimeMappingService.buildTimeString(time);
		if (timePart) {
			edtf += `T${timePart}`;
		}

		edtf += EditDateTimeMappingService.qualifierSuffix(qualifiers);

		return edtf;
	}
}
