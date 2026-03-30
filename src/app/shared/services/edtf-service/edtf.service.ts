import { Injectable } from '@angular/core';
import edtf, { Date, Interval } from 'edtf';

export enum DateQualifier {
	Approximate = 'approximate',
	Uncertain = 'uncertain',
	Unknown = 'unknown',
}

export enum Meridian {
	AM = 'AM',
	PM = 'PM',
}

export enum EdtfPrecision {
	Time = 0,
	Year = 1,
	Month = 2,
	Day = 3,
}

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const TIMEZONES: TimezoneOption[] = [
	{ offset: 'GMT-12:00', name: 'International Date Line West' },
	{ offset: 'GMT-11:00', name: 'Samoa Standard Time' },
	{ offset: 'GMT-10:00', name: 'Hawaii-Aleutian Standard Time' },
	{ offset: 'GMT-09:00', name: 'Alaska Standard Time' },
	{ offset: 'GMT-08:00', name: 'Pacific Standard Time' },
	{ offset: 'GMT-07:00', name: 'Mountain Standard Time' },
	{ offset: 'GMT-06:00', name: 'Central Standard Time' },
	{ offset: 'GMT-05:00', name: 'Eastern Standard Time' },
	{ offset: 'GMT-04:00', name: 'Atlantic Standard Time' },
	{ offset: 'GMT-03:30', name: 'Newfoundland Standard Time' },
	{ offset: 'GMT-03:00', name: 'Argentina Standard Time' },
	{ offset: 'GMT-02:00', name: 'Mid-Atlantic Standard Time' },
	{ offset: 'GMT-01:00', name: 'Azores Standard Time' },
	{ offset: 'GMT+00:00', name: 'Greenwich Mean Time' },
	{ offset: 'GMT+01:00', name: 'Central European Standard Time' },
	{ offset: 'GMT+02:00', name: 'Eastern European Standard Time' },
	{ offset: 'GMT+03:00', name: 'Moscow Standard Time' },
	{ offset: 'GMT+03:30', name: 'Iran Standard Time' },
	{ offset: 'GMT+04:00', name: 'Gulf Standard Time' },
	{ offset: 'GMT+04:30', name: 'Afghanistan Time' },
	{ offset: 'GMT+05:00', name: 'Pakistan Standard Time' },
	{ offset: 'GMT+05:30', name: 'India Standard Time' },
	{ offset: 'GMT+05:45', name: 'Nepal Time' },
	{ offset: 'GMT+06:00', name: 'Bangladesh Standard Time' },
	{ offset: 'GMT+07:00', name: 'Indochina Time' },
	{ offset: 'GMT+08:00', name: 'China Standard Time' },
	{ offset: 'GMT+09:00', name: 'Japan Standard Time' },
	{ offset: 'GMT+09:30', name: 'Australian Central Standard Time' },
	{ offset: 'GMT+10:00', name: 'Australian Eastern Standard Time' },
	{ offset: 'GMT+11:00', name: 'Solomon Islands Time' },
	{ offset: 'GMT+12:00', name: 'New Zealand Standard Time' },
	{ offset: 'GMT+13:00', name: 'Tonga Standard Time' },
];

export const DEFAULT_TIME: TimeModel = {
	hours: '',
	minutes: '',
	seconds: '',
	am: true,
	pm: false,
	timezoneOffset: '',
	timezoneName: '',
};

export const OFFSET_ABBREVIATIONS: Record<string, string> = {
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

export interface TimezoneOption {
	offset: string;
	name: string;
}

export interface DateQualifierFlags {
	approximate: boolean;
	uncertain: boolean;
	unknown: boolean;
}

export interface DateModel {
	year: string;
	month?: string;
	day?: string;
}

export interface TimeModel {
	hours?: string;
	minutes?: string;
	seconds?: string;
	am?: boolean;
	pm?: boolean;
	timezoneOffset?: string;
	timezoneName?: string;
}

export interface DateTimeModel {
	qualifiers?: DateQualifierFlags;
	date: DateModel;
	time: TimeModel;
	endDate?: DateModel;
	endTime?: TimeModel;
}

@Injectable({
	providedIn: 'root',
})
export class EdtfService {

	static offsetToAbbreviation(offset: string): string {
		if (OFFSET_ABBREVIATIONS[offset]) {
			return OFFSET_ABBREVIATIONS[offset];
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

	static buildTzSuffix(tzOffset: string): string {
		if (!tzOffset) return '';
		const match = tzOffset.match(/GMT([+-])(\d{2}):(\d{2})/);
		if (!match) return '';
		const sign = match[1];
		const hrs = parseInt(match[2], 10);
		const mins = parseInt(match[3], 10);
		return mins === 0
			? `${sign}${hrs}`
			: `${sign}${hrs}:${String(mins).padStart(2, '0')}`;
	}

	toDateTimeModel(edtfString: string): DateTimeModel | null {
		if (!edtfString) {
			return null;
		}

		const { timezoneOffset, timezoneName } = this.extractTimezone(edtfString);
		const edtfObject = edtf(edtfString);

		if (edtfObject instanceof Interval) {
			return this.intervalToDateTimeModel(
				edtfObject,
				timezoneOffset,
				timezoneName,
			);
		}
		if (!(edtfObject instanceof Date)) {
			return null;
		}

		return this.extDateToDateTimeModel(
			edtfObject,
			timezoneOffset,
			timezoneName,
		);
	}

	toEdtfDate(model: DateTimeModel): string {
		const { date, time, qualifiers, endDate, endTime } = model;

		const isOpenStart = this.isEmptyDateTime(date, time);
		const isOpenEnd = endDate && this.isEmptyDateTime(endDate, endTime);

		const startPart = isOpenStart
			? '..'
			: this.normalizeEdtfString(date, time, qualifiers);

		const endPart = isOpenEnd
			? '..'
			: endDate
				? this.normalizeEdtfString(endDate, endTime)
				: null;

		return endPart ? `${startPart}/${endPart}` : startPart;
	}

	isValidTime(time: TimeModel): boolean {
		if (!time?.hours) {
			return true;
		}

		const hours = Number(time.hours);
		if (isNaN(hours) || hours < 1 || hours > 12) {
			return false;
		}

		try {
			const timeStr = this.buildTimeString(time);
			edtf(`2000-01-01${timeStr}Z`);
			return true;
		} catch {
			return false;
		}
	}

	isValidDate(date: DateModel): boolean {
		if (!date.year) {
			return false;
		}

		try {
			const dateStr = this.buildDateString(date);
			edtf(dateStr);
			return true;
		} catch {
			return false;
		}
	}

	private buildRawEdtfString(
		date: DateModel,
		time: TimeModel,
	): string {
		const dateStr = this.buildDateString(date);
		const hasCompleteDate = !!(date.year && date.month && date.day);
		const timeStr = hasCompleteDate ? this.buildTimeString(time) : '';
		const utcSuffix = timeStr ? 'Z' : '';
		
		return `${dateStr}${timeStr}${utcSuffix}`;
	}

	private normalizeEdtfString(
		date: DateModel,
		time: TimeModel,
		qualifiers?: DateQualifierFlags,
	): string {
		const rawString = this.buildRawEdtfString(date, time);
		const timeStr = this.buildTimeString(time);
		const hasCompleteDate = !!(date.year && date.month && date.day);
		const timezone = timeStr && hasCompleteDate ? this.formatTimezoneForEdtf(time?.timezoneOffset || '') : '';

		const edtfObject = edtf(rawString);
		let edtfString = edtfObject.toEDTF();

		if (timeStr) {
			edtfString = edtfString.replace(/\.000Z$/g, '').replace(/Z$/g, '');
		}

		let result = timezone ? `${edtfString}${timezone}` : edtfString;

		// Add qualifiers after the complete date-time string (including timezone)
		if (qualifiers?.approximate && qualifiers?.uncertain) {
			result += '%';
		} else if (qualifiers?.approximate) {
			result += '~';
		} else if (qualifiers?.uncertain) {
			result += '?';
		}

		return result;
	}

	private formatTimezoneForEdtf(timezoneOffset: string): string {
		if (!timezoneOffset) return '';
		
		// Convert GMT+hh:mm or GMT-hh:mm to +hh:mm or -hh:mm
		const match = timezoneOffset.match(/GMT([+-]\d{2}:\d{2})/);
		if (match) {
			return match[1];
		}
		
		// If already in +hh:mm or -hh:mm format, return as is
		if (/^[+-]\d{2}:\d{2}$/.test(timezoneOffset)) {
			return timezoneOffset;
		}
		
		return '';
	}

	private buildDateString(date: DateModel): string {
		const year = date.year.padEnd(4, 'X');

		if (!date.month) {
			return year;
		}

		const month = date.month.padStart(2, '0');

		if (!date.day) {
			return `${year}-${month}`;
		}

		const day = date.day.padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	private buildTimeString(time: TimeModel): string {
		if (!time?.hours) {
			return '';
		}

		let hours24 = Number(time.hours);
		if (time.pm && hours24 !== 12) {
			hours24 += 12;
		} else if (time.am && hours24 === 12) {
			hours24 = 0;
		}

		const minutes = time.minutes ?? '00';
		const seconds = time.seconds ?? '00';
		return `T${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`;
	}

	private extractTimezone(edtfString: string): {
		timezoneOffset: string;
		timezoneName: string;
	} {
		if (!edtfString) {
			return { timezoneOffset: '', timezoneName: '' };
		}

		const timezoneMatch = edtfString.match(/T[\d:]+([+-]\d{2}:\d{2}|Z)$/);

		if (!timezoneMatch) {
			return { timezoneOffset: '', timezoneName: '' };
		}

		const offset = timezoneMatch[1];

		if (offset === 'Z') {
			return { timezoneOffset: '+00:00', timezoneName: 'UTC' };
		}

		return { timezoneOffset: offset, timezoneName: '' };
	}

	private extDateToDateTimeModel(
		extDate: Date,
		timezoneOffset: string,
		timezoneName: string,
	): DateTimeModel {
		const edtfStr = extDate.toEDTF();
		const precision = extDate.precision;

		const yearStr = edtfStr.match(/^-?\d*X*/)?.[0] || String(extDate.year);
		const year = yearStr.replace(/X/g, '');

		const hasMonth = precision >= EdtfPrecision.Month;
		const hasDay = precision >= EdtfPrecision.Day;

		const monthPart = hasMonth
			? edtfStr.split('-')[1]?.replace(/[^0-9X]/g, '')
			: undefined;
		const dayPart = hasDay
			? edtfStr
					.split('-')[2]
					?.replace(/[^0-9X]/g, '')
					.substring(0, 2)
			: undefined;

		const month = monthPart === 'XX' ? undefined : monthPart;
		const day = dayPart === 'XX' ? undefined : dayPart;

		const hasTime = precision === EdtfPrecision.Time || edtfStr.includes('T');
		const hours24 = extDate.hours;
		const isPm = hours24 >= 12;
		const hours12 = hours24 % 12 || 12;

		return {
			qualifiers: {
				approximate: extDate.approximate?.value > 0,
				uncertain: extDate.uncertain?.value > 0,
				unknown: extDate.unspecified?.value > 0 && !year && !month && !day,
			},
			date: {
				year,
				month,
				day,
			},
			time: {
				hours: hasTime ? String(hours12).padStart(2, '0') : undefined,
				minutes: hasTime ? String(extDate.minutes).padStart(2, '0') : undefined,
				seconds: hasTime ? String(extDate.seconds).padStart(2, '0') : undefined,
				am: hasTime ? !isPm : undefined,
				pm: hasTime ? isPm : undefined,
				timezoneOffset,
				timezoneName,
			},
		};
	}

	private isEmptyDateTime(date: DateModel, time: TimeModel): boolean {
		return !date.year && !date.month && !date.day && !time?.hours;
	}

	private intervalToDateTimeModel(
		interval: Interval,
		timezoneOffset: string,
		timezoneName: string,
	): DateTimeModel {
		const lower = interval.lower;
		const upper = interval.upper;

		const openStart = typeof lower === 'number' || lower === null;
		const openEnd = typeof upper === 'number' || upper === null;

		const emptyDateTime = {
			date: { year: '' } as DateModel,
			time: { timezoneOffset, timezoneName } as TimeModel,
		};

		const model: DateTimeModel = openStart
			? { ...emptyDateTime }
			: this.extDateToDateTimeModel(lower, timezoneOffset, timezoneName);

		if (openEnd) {
			model.endDate = { ...emptyDateTime.date };
			model.endTime = { ...emptyDateTime.time };
		} else if (upper) {
			const upperModel = this.extDateToDateTimeModel(
				upper,
				timezoneOffset,
				timezoneName,
			);
			model.endDate = upperModel.date;
			model.endTime = upperModel.time;
		}

		return model;
	}

	getMaxDaysInMonth(year: string, month: string): number {
		const y = parseInt(year, 10);
		const m = parseInt(month, 10);

		if (!m || m < 1 || m > 12) return 31;

		if (m === 2 && y) {
			return this.isLeapYear(y) ? 29 : 28;
		}

		return DAYS_IN_MONTH[m - 1];
	}

	isNumeric(value: string): boolean {
		return /^\d+$/.test(value);
	}

	isLeapYear(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	isValidYear(date: DateModel): boolean {
		const year = date.year;
		
		// Empty is valid (optional field)
		if (year === '') return true;
		
		// Must be numeric
		if (!this.isNumeric(year)) return false;
		
		// Must be 4 digits and not start with 0
		if (year.length !== 4 || year.startsWith('0')) return false;
		
		return true;
	}

	isValidMonth(date: DateModel): boolean {
		const month = date.month;
		
		// Empty is valid (optional field)
		if (!month || month === '') return true;
		
		// Must be numeric
		if (!this.isNumeric(month)) return false;
		
		// Must be 1 or 2 digits
		if (month.length > 2) return false;
		
		// First digit must be 0 or 1
		if (month.length === 1) {
			const firstDigit = parseInt(month, 10);
			if (firstDigit > 1) return false;
		}
		
		// If 2 digits, must be between 01 and 12
		if (month.length === 2) {
			const num = parseInt(month, 10);
			if (num < 1 || num > 12) return false;
		}
		
		return true;
	}

	isValidDay(date: DateModel): boolean {
		const day = date.day;
		
		// Empty is valid (optional field)
		if (!day || day === '') return true;
		
		// Must be numeric
		if (!this.isNumeric(day)) return false;
		
		// Must be 1 or 2 digits
		if (day.length > 2) return false;
		
		// Validate first digit based on max days in month
		const maxDay = this.getMaxDaysInMonth(date.year, date.month || '');
		if (day.length === 1) {
			const firstDigit = parseInt(day, 10);
			if (firstDigit > Math.floor(maxDay / 10)) return false;
		}
		
		// If 2 digits, must be between 01 and maxDay
		if (day.length === 2) {
			const num = parseInt(day, 10);
			if (num < 1 || num > maxDay) return false;
		}
		
		return true;
	}

	to24HourTime(time: TimeModel): { hour: number; minute: number; second: number } | null {
		const hour12 = parseInt(time.hours || '0', 10);
		const isPm = time.pm === true;
		const hour = isPm ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
		const minute = parseInt(time.minutes || '0', 10);
		const second = parseInt(time.seconds || '0', 10);

		if (isNaN(hour) || isNaN(minute)) return null;

		return { hour, minute, second: isNaN(second) ? 0 : second };
	}

	isValidHour(value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		if (value.length === 1) return num >= 0 && num <= 1;
		return num >= 1 && num <= 12;
	}

	isValidMinutesSeconds(value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		if (value.length === 1) return num >= 0 && num <= 5;
		return num >= 0 && num <= 59;
	}
}
