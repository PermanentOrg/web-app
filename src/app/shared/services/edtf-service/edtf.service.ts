import { Injectable, inject } from '@angular/core';
import edtf, { Date as EdtfDate, Interval as EdtfInterval } from 'edtf';
import { getHours, getMinutes, getSeconds, isValid, parse } from 'date-fns';
import { TimezoneService } from '@shared/services/timezone-service/timezone.service';

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

export const UNKNOWN_VALUE = 'XXXX-XX-XX';

export const DEFAULT_TIME: TimeModel = {
	hours: '',
	minutes: '',
	seconds: '',
	am: true,
	pm: false,
	timezoneOffset: '',
	timezoneName: '',
};

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
	private readonly timezoneService = inject(TimezoneService);

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
		try {
			if (!edtfString) {
				return null;
			}

			if (/^X{4}-X{2}-X{2}$/i.test(edtfString)) {
				return {
					qualifiers: { approximate: false, uncertain: false, unknown: true },
					date: { year: '', month: '', day: '' },
					time: { ...DEFAULT_TIME },
				};
			}

			if (edtfString.includes('/')) {
				return this.parseInterval(edtfString);
			}

			const referenceDate = this.referenceDateFromEdtfString(edtfString);
			const { timezoneOffset, timezoneName } = this.extractTimezone(
				edtfString,
				referenceDate,
			);
			const normalizedString = this.normalizeForParsing(edtfString);
			const edtfObject = edtf(normalizedString);

			if (!(edtfObject instanceof EdtfDate)) {
				return null;
			}

			return this.extDateToDateTimeModel(
				edtfObject,
				timezoneOffset,
				timezoneName,
			);
		} catch (error) {
			throw new Error(this.toHumanReadableError(error));
		}
	}

	private parseInterval(edtfString: string): DateTimeModel | null {
		const [startPart, endPart] = edtfString.split('/');

		const startReference = this.referenceDateFromEdtfString(startPart);
		const endReference = this.referenceDateFromEdtfString(endPart);
		const startTz = this.extractTimezone(startPart, startReference);
		const endTz = this.extractTimezone(endPart, endReference);

		const normalizedStart =
			startPart === '..' ? '..' : this.normalizeForParsing(startPart);
		const normalizedEnd =
			endPart === '..' ? '..' : this.normalizeForParsing(endPart);

		try {
			const edtfObject = edtf(`${normalizedStart}/${normalizedEnd}`);

			if (!(edtfObject instanceof EdtfInterval)) {
				return null;
			}

			return this.intervalToDateTimeModel(edtfObject, startTz, endTz);
		} catch {
			return null;
		}
	}

	private normalizeForParsing(edtfString: string): string {
		// Replace +hh:mm / -hh:mm timezone offset with Z so the edtf library
		// can parse it — the library requires a UTC designator and throws on offsets.
		return edtfString.replace(/T([\d:]+)[+-]\d{2}:\d{2}/, 'T$1Z');
	}

	toEdtfDate(model: DateTimeModel): string {
		try {
			const { date, time, qualifiers, endDate, endTime } = model;

			if (qualifiers?.unknown) {
				return UNKNOWN_VALUE;
			}

			const isStartEmpty = this.isEmptyDateTime(date, time);
			const isOpenEnd = endDate && this.isEmptyDateTime(endDate, endTime);
			const hasEndDate = endDate && !this.isEmptyDateTime(endDate, endTime);

			if (isStartEmpty && !hasEndDate) {
				return '';
			}

			const startPart = isStartEmpty
				? '..'
				: this.normalizeEdtfString(date, time, qualifiers);

			const endPart = isOpenEnd
				? '..'
				: hasEndDate
					? this.normalizeEdtfString(endDate, endTime, qualifiers)
					: null;
			const stringDate = endPart ? `${startPart}/${endPart}` : startPart;
			edtf(stringDate);
			return stringDate;
		} catch (error) {
			throw new Error(this.toHumanReadableError(error));
		}
	}

	private normalizeEdtfString(
		date: DateModel,
		time: TimeModel,
		qualifiers?: DateQualifierFlags,
	): string {
		const dateStr = this.buildDateString(date);
		const edtfObject = edtf(dateStr);
		// Strip any time/timezone the library may append (e.g. T00:00:00.000Z)
		let result = edtfObject.toEDTF().replace(/T.*$/, '');

		const hasCompleteDate = !!(date.year && date.month && date.day);
		const timeStr = hasCompleteDate ? this.buildTimeString(time) : '';

		if (timeStr) {
			const tzOffset = this.resolveOffsetForSerialization(date, time);
			const timezone = this.formatTimezoneForEdtf(tzOffset);
			result = `${result}${timeStr}${timezone}`;
		}

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

	private resolveOffsetForSerialization(
		date: DateModel,
		time: TimeModel,
	): string {
		// When an IANA zone is selected, re-derive the offset from it so DST
		// transitions for the chosen moment are reflected in the stored EDTF.
		if (time?.timezoneName) {
			const referenceDate = this.buildReferenceDateFromModel(date, time);
			const computed = this.timezoneService.computeOffsetForZone(
				time.timezoneName,
				referenceDate,
			);
			if (computed) return computed;
		}
		return time?.timezoneOffset || '';
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
		const year = date.year.padStart(4, '0');

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
		if (!time?.hours) return '';

		const converted = this.parseTimeAs24Hour(time);
		if (!converted) {
			throw new Error('Invalid time');
		}

		const pad = (n: number): string => String(n).padStart(2, '0');
		return `T${pad(converted.hour)}:${pad(converted.minute)}:${pad(converted.second)}`;
	}

	private extractTimezone(
		edtfString: string,
		referenceDate: Date,
	): {
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
		const gmtOffset = offset === 'Z' ? 'GMT+00:00' : `GMT${offset}`;
		const ianaZone =
			this.timezoneService.findZoneByOffset(gmtOffset, referenceDate) || '';
		return { timezoneOffset: gmtOffset, timezoneName: ianaZone };
	}

	private referenceDateFromEdtfString(edtfString: string): Date {
		const match = edtfString.match(
			/^(-?\d{4})(?:-(\d{2}))?(?:-(\d{2}))?(?:T(\d{2}):(\d{2}):(\d{2}))?/,
		);
		if (!match) return new Date();
		const year = parseInt(match[1], 10);
		const month = match[2] ? parseInt(match[2], 10) - 1 : 0;
		const day = match[3] ? parseInt(match[3], 10) : 1;
		const hour = match[4] ? parseInt(match[4], 10) : 0;
		const minute = match[5] ? parseInt(match[5], 10) : 0;
		const second = match[6] ? parseInt(match[6], 10) : 0;
		return new Date(Date.UTC(year, month, day, hour, minute, second));
	}

	private buildReferenceDateFromModel(date: DateModel, time: TimeModel): Date {
		const year = parseInt(date.year, 10);
		if (Number.isNaN(year)) return new Date();
		const month = date.month ? parseInt(date.month, 10) - 1 : 0;
		const day = date.day ? parseInt(date.day, 10) : 1;
		const time24 = time?.hours ? this.parseTimeAs24Hour(time) : null;
		return new Date(
			Date.UTC(
				year,
				month,
				day,
				time24?.hour ?? 0,
				time24?.minute ?? 0,
				time24?.second ?? 0,
			),
		);
	}

	private extDateToDateTimeModel(
		extDate: EdtfDate,
		timezoneOffset: string,
		timezoneName: string,
	): DateTimeModel {
		const edtfStr = extDate.toEDTF();
		const precision = extDate.precision;

		const yearStr = edtfStr.match(/^-?\d*X*/)?.[0] || String(extDate.year);
		const year = yearStr.replace(/X/g, '');

		const hasMonth =
			precision === EdtfPrecision.Time || precision >= EdtfPrecision.Month;
		const hasDay =
			precision === EdtfPrecision.Time || precision >= EdtfPrecision.Day;

		const monthPart = hasMonth
			? edtfStr.split('-')[1]?.replace(/[^0-9X]/g, '')
			: undefined;
		const dayPart = hasDay
			? edtfStr
					.split('-')[2]
					?.replace(/[^0-9X]/g, '')
					.substring(0, 2)
			: undefined;

		const month = monthPart === 'XX' ? '' : (monthPart ?? '');
		const day = dayPart === 'XX' ? '' : (dayPart ?? '');

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
				hours: hasTime ? String(hours12).padStart(2, '0') : '',
				minutes: hasTime ? String(extDate.minutes).padStart(2, '0') : '',
				seconds: hasTime ? String(extDate.seconds).padStart(2, '0') : '',
				am: hasTime ? !isPm : true,
				pm: hasTime ? isPm : false,
				timezoneOffset,
				timezoneName,
			},
		};
	}

	private isEmptyDateTime(date: DateModel, time: TimeModel): boolean {
		return !date.year && !date.month && !date.day && !time?.hours;
	}

	private toHumanReadableError(error: unknown): string {
		const message = error instanceof Error ? error.message.toLowerCase() : '';

		if (
			message.includes('invalid interval') ||
			message.includes('invalid lower bound') ||
			message.includes('invalid upper bound')
		) {
			return 'The date range is not valid. Please make sure the start date is before the end date.';
		}

		return 'The date entered is not valid. Please check the values and try again.';
	}

	private intervalToDateTimeModel(
		interval: EdtfInterval,
		startTz: { timezoneOffset: string; timezoneName: string },
		endTz: { timezoneOffset: string; timezoneName: string },
	): DateTimeModel {
		const lower = interval.lower;
		const upper = interval.upper;

		const openStart = typeof lower === 'number' || lower === null;
		const openEnd = typeof upper === 'number' || upper === null;

		const model: DateTimeModel = openStart
			? { date: { year: '' } as DateModel, time: { ...startTz } as TimeModel }
			: this.extDateToDateTimeModel(
					lower,
					startTz.timezoneOffset,
					startTz.timezoneName,
				);

		if (openEnd) {
			model.endDate = { year: '' } as DateModel;
			model.endTime = { ...endTz } as TimeModel;
		} else if (upper) {
			const upperModel = this.extDateToDateTimeModel(
				upper,
				endTz.timezoneOffset,
				endTz.timezoneName,
			);
			model.endDate = upperModel.date;
			model.endTime = upperModel.time;
		}

		return model;
	}

	isNumeric(value: string): boolean {
		return /^\d+$/.test(value);
	}

	parseTimeAs24Hour(
		time: TimeModel,
	): { hour: number; minute: number; second: number } | null {
		// '12' default lets empty hours collapse to midnight via the AM branch below
		// (12-hour clock has no '0', so parse('0 AM') would be invalid)
		const hoursInput = time.hours || '12';
		const minutesInput = time.minutes || '0';
		const secondsInput = time.seconds || '0';
		const meridian = time.pm === true ? 'PM' : 'AM';

		const parsed = parse(
			`${hoursInput}:${minutesInput}:${secondsInput} ${meridian}`,
			'h:m:s a',
			new Date(),
		);

		if (!isValid(parsed)) return null;

		return {
			hour: getHours(parsed),
			minute: getMinutes(parsed),
			second: getSeconds(parsed),
		};
	}

	isValidHour(value: string): boolean {
		if (value.length === 1) return parseInt(value, 10) <= 1;
		// 12-hour clock — defer to date-fns parse to verify the full value (01-12)
		return isValid(parse(`${value}:00 AM`, 'hh:mm a', new Date()));
	}

	isValidMinutesSeconds(value: string): boolean {
		if (value.length === 1) return parseInt(value, 10) <= 5;
		// Defer to date-fns parse to verify the full value (00-59)
		return isValid(parse(`12:${value}:00 AM`, 'hh:mm:ss a', new Date()));
	}

	isValidYear(value: string): boolean {
		if (value === '') return true;
		return /^\d{1,4}$/.test(value);
	}

	isValidMonth(value: string): boolean {
		if (value === '') return true;
		if (/^\d$/.test(value)) return parseInt(value, 10) <= 1;
		return isValid(parse(value, 'MM', new Date()));
	}

	isValidDay(value: string, year: string, month: string): boolean {
		if (value === '') return true;
		// Defaults let day be typed before year/month are filled in.
		// 2000 is a leap year (allows Feb 29); 01 has 31 days (most permissive).
		const yearStr = year.length === 4 ? year : '2000';
		const monthStr = month.length === 2 ? month : '01';
		const dayStr = value.padStart(2, '0');
		return isValid(
			parse(`${yearStr}-${monthStr}-${dayStr}`, 'yyyy-MM-dd', new Date()),
		);
	}
}
