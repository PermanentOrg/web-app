import { Injectable, OnDestroy } from '@angular/core';

export interface EdtfParseResult {
	values: number[];
	approximate?: boolean;
	uncertain?: boolean;
	offset?: number;
}

export function parseEdtf(input: string): EdtfParseResult {
	if (!input || typeof input !== 'string') {
		throw new Error('Invalid EDTF input');
	}

	let str = input.trim();
	let approximate = false;
	let uncertain = false;

	if (str.endsWith('%')) {
		approximate = true;
		uncertain = true;
		str = str.slice(0, -1);
	} else if (str.endsWith('~')) {
		approximate = true;
		str = str.slice(0, -1);
	} else if (str.endsWith('?')) {
		uncertain = true;
		str = str.slice(0, -1);
	}

	let offset: number | undefined;
	let timePart: string | undefined;

	const tIndex = str.indexOf('T');
	let datePart = str;

	if (tIndex !== -1) {
		datePart = str.slice(0, tIndex);
		let timeStr = str.slice(tIndex + 1);

		const zIndex = timeStr.indexOf('Z');
		if (zIndex >= 0) {
			offset = 0;
			timeStr = timeStr.slice(0, zIndex);
		} else {
			const tzMatch = timeStr.match(/([+-])(\d{2}):(\d{2})$/);
			if (tzMatch) {
				const sign = tzMatch[1] === '+' ? 1 : -1;
				const tzHrs = parseInt(tzMatch[2], 10);
				const tzMins = parseInt(tzMatch[3], 10);
				offset = sign * (tzHrs * 60 + tzMins);
				timeStr = timeStr.slice(0, tzMatch.index);
			}
		}

		timePart = timeStr;
	}

	const dateParts = datePart.split('-').filter((p) => p !== '');
	if (dateParts.length === 0) {
		throw new Error('Invalid EDTF date');
	}

	const values: number[] = [];

	const isNegativeYear = datePart.startsWith('-');
	const yearValue = parseInt(dateParts[0], 10);
	if (isNaN(yearValue)) {
		throw new Error('Invalid EDTF date');
	}
	values.push(isNegativeYear ? -yearValue : yearValue);

	if (dateParts.length > 1) {
		const monthIdx = isNegativeYear ? 1 : 1;
		values.push(parseInt(dateParts[monthIdx], 10) - 1);
	}

	if (dateParts.length > 2) {
		const dayIdx = isNegativeYear ? 2 : 2;
		values.push(parseInt(dateParts[dayIdx], 10));
	}

	if (timePart) {
		const timeParts = timePart.split(':');
		values.push(parseInt(timeParts[0], 10) || 0);
		values.push(parseInt(timeParts[1], 10) || 0);
		values.push(parseInt(timeParts[2], 10) || 0);
	}

	const result: EdtfParseResult = { values };
	if (approximate) result.approximate = true;
	if (uncertain) result.uncertain = true;
	if (offset !== undefined) result.offset = offset;

	return result;
}

export function formatEdtfDate(
	dateParts: string,
	locale: string = 'en-US',
	options: Intl.DateTimeFormatOptions = {},
): string {
	const parts = dateParts.split('-').map((p) => parseInt(p, 10));
	const year = parts[0];
	const month = parts.length > 1 ? parts[1] - 1 : 0;
	const day = parts.length > 2 ? parts[2] : 1;

	const formatOptions: Intl.DateTimeFormatOptions = { ...options };

	if (parts.length >= 1) formatOptions.year = formatOptions.year ?? 'numeric';
	if (parts.length >= 2) formatOptions.month = formatOptions.month ?? 'long';
	if (parts.length >= 3) formatOptions.day = formatOptions.day ?? 'numeric';

	const date = new Date(year, month, day);
	if (year >= 0 && year < 100) {
		date.setFullYear(year);
	}

	return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

export enum Meridian {
	AM = 'AM',
	PM = 'PM',
}

export interface TimeModel {
	hours: string;
	minutes: string;
	seconds: string;
	amPm: Meridian;
}

export enum DateQualifier {
	Approximate = 'approximate',
	Uncertain = 'uncertain',
	Unknown = 'unknown',
}

export interface DateModel {
	year: string;
	month: string;
	day: string;
}

export interface TimezoneModel {
	timezoneOffset: string;
	timezoneName: string;
}

export interface EdtfDateModel {
	qualifiers?: Map<DateQualifier, boolean>;
	date: DateModel;
	time?: TimeModel;
	timezone?: TimezoneModel;
}

const OFFSET_ABBREVIATIONS: Record<string, string> = {
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

@Injectable({ providedIn: 'root' })
export class EdtfDateService implements OnDestroy {
	private edtfString: string;
	private _edtfObject: EdtfDateModel;

	private static readonly EMPTY_OBJECT: EdtfDateModel = {
		date: { year: '', month: '', day: '' },
	};

	constructor(edtfString: string) {
		this.edtfString = edtfString;
		this._edtfObject = {
			...EdtfDateService.EMPTY_OBJECT,
			date: { ...EdtfDateService.EMPTY_OBJECT.date },
		};
	}

	get edtfObject(): EdtfDateModel {
		return this._edtfObject;
	}

	ngOnDestroy(): void {
		this.edtfString = '';
		this._edtfObject = {
			...EdtfDateService.EMPTY_OBJECT,
			date: { ...EdtfDateService.EMPTY_OBJECT.date },
		};
	}

	parseEdtfDate(): void {
		if (!this.edtfString) return;

		try {
			const parsed = parseEdtf(this.edtfString);
			const values = parsed.values;

			this._edtfObject.date = this.getDateFromEdtfValues(values);

			if (values.length > 3) {
				this._edtfObject.time = this.getTimeFromEdtfValues(values);
			}

			if (parsed.offset !== undefined && parsed.offset !== null) {
				this._edtfObject.timezone = this.getTimezoneFromOffset(parsed.offset);
			}

			const qualifiers = this.getQualifiersFromParsedEdtf(parsed);
			if (qualifiers.size > 0) {
				this._edtfObject.qualifiers = qualifiers;
			}
		} catch {
			// invalid input; edtfObject remains null
		}
	}

	private getQualifiersFromParsedEdtf(parsed: {
		approximate?: boolean;
		uncertain?: boolean;
	}): Map<DateQualifier, boolean> {
		const qualifiers = new Map<DateQualifier, boolean>();
		if (parsed.approximate) qualifiers.set(DateQualifier.Approximate, true);
		if (parsed.uncertain) qualifiers.set(DateQualifier.Uncertain, true);
		return qualifiers;
	}

	private getDateFromEdtfValues(values: number[]): DateModel {
		return {
			year: values[0] == null ? '' : String(values[0]),
			month: values[1] == null ? '' : String(values[1] + 1).padStart(2, '0'),
			day: values[2] == null ? '' : String(values[2]).padStart(2, '0'),
		};
	}

	private getTimeFromEdtfValues(values: number[]): TimeModel {
		const hour24 = values[3];
		let hours: string;
		let amPm: Meridian;

		if (hour24 === 0) {
			hours = '12';
			amPm = Meridian.AM;
		} else if (hour24 < 12) {
			hours = String(hour24).padStart(2, '0');
			amPm = Meridian.AM;
		} else if (hour24 === 12) {
			hours = '12';
			amPm = Meridian.PM;
		} else {
			hours = String(hour24 - 12).padStart(2, '0');
			amPm = Meridian.PM;
		}

		return {
			hours,
			minutes: values[4] == null ? '' : String(values[4]).padStart(2, '0'),
			seconds: values[5] == null ? '' : String(values[5]).padStart(2, '0'),
			amPm,
		};
	}

	private getTimezoneFromOffset(offset: number): TimezoneModel {
		const totalMinutes = Math.abs(offset);
		const hrs = Math.floor(totalMinutes / 60);
		const mins = totalMinutes % 60;
		const sign = offset >= 0 ? '+' : '-';
		const timezoneOffset = `GMT${sign}${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

		let timezoneName: string;
		if (OFFSET_ABBREVIATIONS[timezoneOffset]) {
			timezoneName = OFFSET_ABBREVIATIONS[timezoneOffset];
		} else {
			const match = timezoneOffset.match(/GMT([+-])(\d{2}):(\d{2})/);
			if (match) {
				const s = match[1];
				const h = parseInt(match[2], 10);
				const m = parseInt(match[3], 10);
				timezoneName =
					m === 0 ? `UTC${s}${h}` : `UTC${s}${h}:${String(m).padStart(2, '0')}`;
			} else {
				timezoneName = timezoneOffset;
			}
		}

		return { timezoneOffset, timezoneName };
	}
}
