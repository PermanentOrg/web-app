import { Injectable } from '@angular/core';
import edtf, { Date as EdtfDate, Interval as EdtfInterval } from 'edtf';
import {
	format,
	getHours,
	getMinutes,
	getSeconds,
	isValid,
	parse,
} from 'date-fns';

export enum DateQualifier {
	Approximate = 'approximate',
	Uncertain = 'uncertain',
	Unknown = 'unknown',
}

export type TimeFormat = 'am' | 'pm' | 'h24';

export const TIME_FORMAT_LABEL: Record<TimeFormat, string> = {
	am: 'AM',
	pm: 'PM',
	h24: '24H',
};

export enum EdtfPrecision {
	Time = 0,
	Year = 1,
	Month = 2,
	Day = 3,
}

export const UNKNOWN_VALUE = 'XXXX-XX-XX';

export const MONTH_RANGE_ERROR = 'Month must be between 1 and 12.';
export const DAY_RANGE_ERROR = 'Day must be between 1 and 31.';
export const INVALID_DAY_FOR_MONTH_ERROR =
	'That day does not exist in the selected month and year.';

const DIGITS_ONLY = /^\d*$/;

export const DEFAULT_TIME: TimeModel = {
	hours: '',
	minutes: '',
	seconds: '',
	format: 'am',
};

export interface DateQualifierFlags {
	approximate: boolean;
	uncertain: boolean;
	unknown: boolean;
}

export const DEFAULT_DATE_QUALIFIERS: DateQualifierFlags = {
	approximate: false,
	uncertain: false,
	unknown: false,
};

export interface DateModel {
	year: string;
	month?: string;
	day?: string;
}

export interface TimeModel {
	hours?: string;
	minutes?: string;
	seconds?: string;
	format: TimeFormat;
	timezoneOffset?: string;
}

export interface DateTimeModel {
	qualifiers?: DateQualifierFlags;
	date: DateModel;
	time: TimeModel;
	endQualifiers?: DateQualifierFlags;
	endDate?: DateModel;
	endTime?: TimeModel;
}

@Injectable({
	providedIn: 'root',
})
export class EdtfService {
	toDateTimeModel(edtfString: string): DateTimeModel | null {
		try {
			if (!edtfString) {
				return null;
			}

			if (edtfString.includes('/')) {
				return this.parseInterval(edtfString);
			}

			// The library can't parse a qualifier alongside unspecified (X) digits,
			// so for those strings we strip the trailing qualifier, parse the base,
			// and reattach the flags below.
			const hasUnspecified = this.hasUnspecifiedDigits(edtfString);
			const { base, approximate, uncertain } = hasUnspecified
				? this.parseTrailingQualifier(edtfString)
				: { base: edtfString, approximate: false, uncertain: false };

			if (/^X{4}-X{2}-X{2}$/i.test(base)) {
				return {
					qualifiers: { ...DEFAULT_DATE_QUALIFIERS, unknown: true },
					date: { year: '', month: '', day: '' },
					time: { ...DEFAULT_TIME },
				};
			}

			const normalizedString = this.normalizeForParsing(base);
			const edtfObject = edtf(normalizedString);

			if (!(edtfObject instanceof EdtfDate)) {
				return null;
			}

			const model = this.extDateToDateTimeModel(edtfObject, base);
			if (hasUnspecified && model.qualifiers && !model.qualifiers.unknown) {
				model.qualifiers.approximate = approximate;
				model.qualifiers.uncertain = uncertain;
			}
			return model;
		} catch (error) {
			throw new Error(this.toHumanReadableError(error));
		}
	}

	getEdtfIntervalStartDate(edtfString: string | null | undefined): string {
		if (!edtfString) {
			return '';
		}

		if (!edtfString.includes('/')) {
			return edtfString;
		}

		const [startPart] = edtfString.split('/');
		return startPart === '..' ? '' : (startPart ?? '');
	}

	private parseInterval(edtfString: string): DateTimeModel | null {
		const [rawStart, rawEnd] = edtfString.split('/');

		// Only the unspecified-digit (X) case needs the strip-and-reattach
		// workaround; without X the library parses per-side qualifiers natively
		// (and rejects a qualifier combined with a time, which we keep blocking).
		const hasUnspecified = this.hasUnspecifiedDigits(edtfString);
		const start = hasUnspecified
			? this.parseTrailingQualifier(rawStart ?? '')
			: { base: rawStart ?? '', approximate: false, uncertain: false };
		const end = hasUnspecified
			? this.parseTrailingQualifier(rawEnd ?? '')
			: { base: rawEnd ?? '', approximate: false, uncertain: false };

		const normalizedStart =
			start.base === '..' || start.base === ''
				? start.base
				: this.normalizeForParsing(start.base);
		const normalizedEnd =
			end.base === '..' || end.base === ''
				? end.base
				: this.normalizeForParsing(end.base);

		try {
			const edtfObject = edtf(`${normalizedStart}/${normalizedEnd}`);

			if (!(edtfObject instanceof EdtfInterval)) {
				return null;
			}

			const model = this.intervalToDateTimeModel(
				edtfObject,
				start.base,
				end.base,
			);

			if (hasUnspecified) {
				if (model.qualifiers && !model.qualifiers.unknown) {
					model.qualifiers.approximate = start.approximate;
					model.qualifiers.uncertain = start.uncertain;
				}
				if (model.endQualifiers && !model.endQualifiers.unknown) {
					model.endQualifiers.approximate = end.approximate;
					model.endQualifiers.uncertain = end.uncertain;
				}
			}

			return model;
		} catch {
			return null;
		}
	}

	private normalizeForParsing(edtfString: string): string {
		// Replace any timezone offset (or absent designator) with Z so the edtf
		// library treats the wall-clock digits as UTC — otherwise it converts the
		// value to UTC, which can shift the date parts we extract for display.
		// The wall-clock time itself is read from the raw string (extractRawTime),
		// and the original offset is preserved separately in the model.
		return edtfString.replace(
			/T(\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)(?:Z|[+-]\d{2}:\d{2})?$/,
			'T$1Z',
		);
	}

	toEdtfDate(model: DateTimeModel): string {
		try {
			const { date, time, qualifiers, endQualifiers, endDate, endTime } = model;
			const hasRange = !!endDate;

			if (!hasRange && qualifiers?.unknown) {
				return UNKNOWN_VALUE;
			}

			const isStartEmpty = this.isEmptyDateTime(date, time);
			const isEndEmpty = hasRange && this.isEmptyDateTime(endDate, endTime);

			if (isStartEmpty && !hasRange) {
				return '';
			}

			const startPart = qualifiers?.unknown
				? ''
				: isStartEmpty
					? '..'
					: this.normalizeEdtfString(date, time, qualifiers);

			let endPart: string | null = null;
			if (hasRange) {
				endPart = endQualifiers?.unknown
					? ''
					: isEndEmpty
						? '..'
						: this.normalizeEdtfString(endDate, endTime, endQualifiers);
			}

			const stringDate =
				endPart === null ? startPart : `${startPart}/${endPart}`;
			// The edtf library's grammar rejects a qualifier (~/?/%) combined with
			// unspecified (X) digits, but that combination is valid EDTF the backend
			// accepts, so for those we validate the qualifier-stripped base instead.
			edtf(
				this.hasUnspecifiedDigits(stringDate)
					? this.stripGroupQualifiers(stringDate)
					: stringDate,
			);
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
		const hasCompleteDate = !!(date.year && date.month && date.day);
		const hasTime = !!time?.hours;

		if (hasTime && !hasCompleteDate) {
			throw new Error('A complete date is required when time is provided.');
		}

		const dateStr = this.buildDateString(date);
		const edtfObject = edtf(dateStr);
		// Strip any time/timezone the library may append (e.g. T00:00:00.000Z)
		let result = edtfObject.toEDTF().replace(/T.*$/, '');

		const timeStr = hasTime ? this.buildTimeString(time) : '';

		if (timeStr) {
			result = `${result}${timeStr}`;
		}

		// Add qualifiers after the complete date-time string
		result += this.buildQualifierSuffix(qualifiers);

		return result;
	}

	private hasUnspecifiedDigits(edtfString: string): boolean {
		return /X/i.test(edtfString);
	}

	private buildQualifierSuffix(qualifiers?: DateQualifierFlags): string {
		if (qualifiers?.approximate && qualifiers?.uncertain) return '%';
		if (qualifiers?.approximate) return '~';
		if (qualifiers?.uncertain) return '?';
		return '';
	}

	// Inverse of buildQualifierSuffix: split a trailing group qualifier off a
	// single date
	private parseTrailingQualifier(part: string): {
		base: string;
		approximate: boolean;
		uncertain: boolean;
	} {
		const suffix = part.slice(-1);
		if (suffix === '%')
			return { base: part.slice(0, -1), approximate: true, uncertain: true };
		if (suffix === '~')
			return { base: part.slice(0, -1), approximate: true, uncertain: false };
		if (suffix === '?')
			return { base: part.slice(0, -1), approximate: false, uncertain: true };
		return { base: part, approximate: false, uncertain: false };
	}

	// Remove group qualifiers (~/?/%) that sit at the end of the whole string or
	// at an interval boundary, leaving a base string the edtf library can parse
	// even when it contains unspecified (X) digits. Used for serialize-time
	// validation only.
	private stripGroupQualifiers(edtfString: string): string {
		return edtfString.replace(/[%~?](?=\/|$)/g, '');
	}

	private buildDateString(date: DateModel): string {
		const hasYear = !!date.year;
		const hasMonth = !!date.month;
		const hasDay = !!date.day;

		if (!hasYear && !hasMonth && !hasDay) return '';

		// A lone '0' is an unfinished value ('05' minus a keystroke), never a
		// month or day on its own — reject it instead of guessing ('0X').
		if (date.month === '0') throw new Error(MONTH_RANGE_ERROR);
		if (date.day === '0') throw new Error(DAY_RANGE_ERROR);

		const year = this.padWithX(date.year, 4);
		if (!hasMonth && !hasDay) return year;

		const month = hasMonth ? this.padMonthOrDay(date.month) : 'XX';
		if (!hasDay) return `${year}-${month}`;

		const day = this.padMonthOrDay(date.day);
		const dateStr = `${year}-${month}-${day}`;

		// A fully-numeric date with an in-range month and day can still be an
		// impossible calendar day (e.g. Feb 29 in a non-leap year, or Apr 31). The
		// edtf library silently rolls those forward (2021-02-29 becomes 2021-03-01),
		// so reject them here instead of storing the shift
		const monthNumber = parseInt(month, 10);
		const dayNumber = parseInt(day, 10);
		if (
			/^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
			monthNumber >= 1 &&
			monthNumber <= 12 &&
			dayNumber >= 1 &&
			dayNumber <= 31 &&
			!isValid(parse(dateStr, 'yyyy-MM-dd', new Date()))
		) {
			throw new Error(INVALID_DAY_FOR_MONTH_ERROR);
		}

		return dateStr;
	}

	// Shared by serialization (toEdtfDate) and display (formatDateForDisplay)
	// so a saved value always reads back the way the preview rendered it.
	private padMonthOrDay(value: string): string {
		// A single digit is zero-padded ('1' → '01', i.e. January / the 1st).
		// '1' could in principle be the start of '10'–'12', but this runs on a
		// finished value, not mid-keystroke, and the digits-only inputs give no
		// way to type an unspecified digit — so '1X' is not expressible intent.
		if (/^[1-9]$/.test(value)) return `0${value}`;
		return this.padWithX(value, 2);
	}

	private padWithX(value: string, width: number): string {
		const v = value ?? '';
		return v.length >= width ? v : v + 'X'.repeat(width - v.length);
	}

	// Human-readable counterpart of buildDateString: both share padWithX and
	// padMonthOrDay, so the preview always shows what serialization will write.
	// Unlike serialization it must tolerate in-progress values (it renders
	// live while the user types), so it never throws.
	formatDateForDisplay(date: DateModel): string {
		const yearRaw = date.year ?? '';
		const monthRaw = date.month ?? '';
		const dayRaw = date.day ?? '';

		const hasYear = !!yearRaw;
		const hasMonth = !!monthRaw;
		// A lone '0' day is an unfinished value ('05' minus a keystroke), so
		// the preview treats it as absent rather than guessing.
		const hasDay = !!dayRaw && parseInt(dayRaw, 10) !== 0;

		if (!hasYear && !hasMonth && !hasDay) return '';

		const yearDisplay = this.padWithX(yearRaw, 4);
		const monthPadded = hasMonth ? this.padMonthOrDay(monthRaw) : 'XX';
		const monthName = /^\d{2}$/.test(monthPadded)
			? format(new Date(2000, parseInt(monthPadded, 10) - 1), 'MMMM')
			: null;
		const dayDisplay = hasDay ? this.padMonthOrDay(dayRaw) : '';

		if (monthName && hasDay)
			return `${monthName} ${dayDisplay}, ${yearDisplay}`;
		if (monthName) return `${monthName} ${yearDisplay}`;
		if (!hasMonth && !hasDay) return yearDisplay;

		const parts: string[] = [yearDisplay, monthPadded];
		if (hasDay) parts.push(dayDisplay);
		return parts.join('-');
	}

	private buildTimeString(time: TimeModel): string {
		if (!time?.hours) return '';

		const converted = this.parseTimeAs24Hour(time);
		if (!converted) {
			throw new Error('Invalid time');
		}

		const timezoneOffset = time.timezoneOffset ?? this.localTimezoneOffset();
		const pad = (n: number): string => String(n).padStart(2, '0');
		return `T${pad(converted.hour)}:${pad(converted.minute)}:${pad(converted.second)}${timezoneOffset}`;
	}

	private localTimezoneOffset(): string {
		const offsetMinutes = -new Date().getTimezoneOffset();
		const sign = offsetMinutes < 0 ? '-' : '+';
		const absoluteMinutes = Math.abs(offsetMinutes);
		const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
		const minutes = String(absoluteMinutes % 60).padStart(2, '0');
		return `${sign}${hours}:${minutes}`;
	}

	private extDateToDateTimeModel(
		extDate: EdtfDate,
		rawEdtfString: string,
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

		const month = (monthPart ?? '').replace(/X+$/i, '');
		const day = (dayPart ?? '').replace(/X+$/i, '');

		const hasTime = precision === EdtfPrecision.Time || edtfStr.includes('T');
		// Read the wall-clock time from the original input string instead of
		// extDate.hours/minutes/seconds — the edtf library treats unmarked
		// times as local and shifts them to UTC, which corrupts the value
		// we want to display unchanged (see node_modules/edtf/src/util.js
		// `datetime` postprocess).
		const rawTime = hasTime ? this.extractRawTime(rawEdtfString) : null;
		const hours24 = rawTime?.hours ?? 0;
		const minutes = rawTime?.minutes ?? 0;
		const seconds = rawTime?.seconds ?? 0;
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
				minutes: hasTime ? String(minutes).padStart(2, '0') : '',
				seconds: hasTime ? String(seconds).padStart(2, '0') : '',
				format: hasTime && isPm ? 'pm' : 'am',
				timezoneOffset: rawTime?.timezoneOffset,
			},
		};
	}

	private extractRawTime(edtfString: string): {
		hours: number;
		minutes: number;
		seconds: number;
		timezoneOffset?: string;
	} | null {
		const match = edtfString.match(
			/T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?([+-]\d{2}:\d{2})?/,
		);
		if (!match) return null;
		return {
			hours: parseInt(match[1], 10),
			minutes: parseInt(match[2], 10),
			seconds: match[3] ? parseInt(match[3], 10) : 0,
			timezoneOffset: match[4],
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

		if (message.includes('complete date is required')) {
			return 'A complete date is required when time is provided.';
		}

		// Segment errors (month/day range, day-for-month) are shown inline under
		// the offending field, so the footer/toast only needs the generic message —
		// no need to duplicate the specific one here. Errors without an inline
		// counterpart (the date-range and complete-date cases above) keep theirs.
		return 'The date entered is not valid. Please check the values and try again.';
	}

	private intervalToDateTimeModel(
		interval: EdtfInterval,
		startRaw: string,
		endRaw: string,
	): DateTimeModel {
		const lower = interval.lower;
		const upper = interval.upper;

		const isStartUnknownSlot = startRaw === '';
		const isEndUnknownSlot = endRaw === '';
		const isStartOpenBound = startRaw === '..';
		const isEndOpenBound = endRaw === '..';

		let model: DateTimeModel;
		if (isStartUnknownSlot) {
			model = {
				qualifiers: { ...DEFAULT_DATE_QUALIFIERS, unknown: true },
				date: { year: '', month: '', day: '' },
				time: { ...DEFAULT_TIME },
			};
		} else if (
			isStartOpenBound ||
			lower === null ||
			typeof lower === 'number'
		) {
			model = { date: { year: '' } as DateModel, time: { format: 'am' } };
		} else {
			model = this.extDateToDateTimeModel(lower, startRaw);
		}

		if (isEndUnknownSlot) {
			model.endQualifiers = { ...DEFAULT_DATE_QUALIFIERS, unknown: true };
			model.endDate = { year: '', month: '', day: '' };
			model.endTime = { ...DEFAULT_TIME };
		} else if (isEndOpenBound || upper === null || typeof upper === 'number') {
			model.endDate = { year: '' } as DateModel;
			model.endTime = { format: 'am' };
		} else if (upper) {
			const upperModel = this.extDateToDateTimeModel(upper, endRaw);
			model.endQualifiers = upperModel.qualifiers;
			model.endDate = upperModel.date;
			model.endTime = upperModel.time;
		}

		return model;
	}

	buildReferenceDate(date: DateModel, time: TimeModel): Date {
		const year = parseInt(date?.year ?? '', 10);
		if (Number.isNaN(year)) return new Date();
		const month = date.month ? parseInt(date.month, 10) - 1 : 0;
		const day = date.day ? parseInt(date.day, 10) : 1;
		const time24 = time?.hours ? this.parseTimeAs24Hour(time) : null;
		return new Date(
			year,
			month,
			day,
			time24?.hour ?? 0,
			time24?.minute ?? 0,
			time24?.second ?? 0,
		);
	}

	browserTimezoneAbbreviation(date: DateModel, time: TimeModel): string {
		if (!time?.hours) return '';
		try {
			const referenceDate = this.buildReferenceDate(date, time);
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZoneName: 'short',
			}).formatToParts(referenceDate);
			const timezoneName =
				parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
			return this.normalizeTimezoneOffsetDisplay(timezoneName);
		} catch {
			return '';
		}
	}

	// Intl 'short' renders offset-only zones as e.g. GMT+3 or GMT+5:30;
	// rewrite the offset part to the canonical +/-HH:MM form (GMT+03:00).
	private normalizeTimezoneOffsetDisplay(timezoneName: string): string {
		const offsetMatch = /([+-])(\d{1,2})(?::(\d{2}))?/.exec(timezoneName);
		if (!offsetMatch) return timezoneName;
		const [rawOffset, sign, offsetHours, offsetMinutes] = offsetMatch;
		const normalizedOffset = `${sign}${offsetHours.padStart(2, '0')}:${offsetMinutes ?? '00'}`;
		return timezoneName.replace(rawOffset, normalizedOffset);
	}

	parseTimeAs24Hour(
		time: TimeModel,
	): { hour: number; minute: number; second: number } | null {
		const minutesInput = time.minutes || '0';
		const secondsInput = time.seconds || '0';

		if (time.format === 'h24') {
			const parsed = parse(
				`${time.hours || '0'}:${minutesInput}:${secondsInput}`,
				'H:m:s',
				new Date(),
			);
			if (!isValid(parsed)) return null;
			return {
				hour: getHours(parsed),
				minute: getMinutes(parsed),
				second: getSeconds(parsed),
			};
		}

		// '12' default lets empty hours collapse to midnight via the AM branch below
		// (12-hour clock has no '0', so parse('0 AM') would be invalid)
		const hoursInput = time.hours || '12';
		const meridian = time.format === 'pm' ? 'PM' : 'AM';

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

	isValidHour(value: string, is24Hour = false): boolean {
		if (is24Hour) {
			if (value.length === 1) return parseInt(value, 10) <= 2;
			// 24-hour clock — defer to date-fns parse to verify the full value (00-23)
			return isValid(parse(`${value}:00`, 'HH:mm', new Date()));
		}
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
		// A single digit is an in-progress value (e.g. "0" while deleting "05"),
		// so accept it; full validation runs once two digits are entered.
		if (/^\d$/.test(value)) return true;
		// Defaults let day be typed before year/month are filled in.
		// 2000 is a leap year (allows Feb 29); 01 has 31 days (most permissive).
		// A single-digit month is a complete value (e.g. '2' is February), so pad
		// it rather than discarding it — otherwise a bad day like Feb 29 would be
		// validated against January and wrongly pass.
		const yearStr = year.length === 4 ? year : '2000';
		const monthStr = month ? month.padStart(2, '0') : '01';
		const dayStr = value.padStart(2, '0');
		return isValid(
			parse(`${yearStr}-${monthStr}-${dayStr}`, 'yyyy-MM-dd', new Date()),
		);
	}

	getSegmentError(
		value: string,
		options: {
			invalidCharsMessage: string;
			isWithinRange?: (completeValue: string) => boolean;
			rangeMessage?: string;
		},
	): string | null {
		if (value === '') return null;
		if (!DIGITS_ONLY.test(value)) return options.invalidCharsMessage;
		if (value.length < 2) return null;
		if (options.isWithinRange && !options.isWithinRange(value)) {
			return options.rangeMessage ?? null;
		}
		return null;
	}

	getMonthError(
		value: string,
		options: { invalidCharsMessage: string },
	): string | null {
		// A lone "0" is an unfinished value ("05" minus a keystroke), not a valid
		// month — flag it inline instead of leaving it to serialization.
		if (value === '0') return MONTH_RANGE_ERROR;

		return this.getSegmentError(value, {
			invalidCharsMessage: options.invalidCharsMessage,
			isWithinRange: (month) => this.isValidMonth(month),
			rangeMessage: MONTH_RANGE_ERROR,
		});
	}

	// Validates a day segment in tiers so each failure gets a specific message:
	// a lone "0", then the plain 1–31 range, then whether that day actually
	// exists in the selected month/year (e.g. Feb 29 in a non-leap year).
	getDayError(
		value: string,
		year: string,
		month: string,
		options: { invalidCharsMessage: string },
	): string | null {
		// A lone "0" is an unfinished value ("05" minus a keystroke), not a valid
		// day — flag it inline instead of leaving it to serialization.
		if (value === '0') return DAY_RANGE_ERROR;

		const rangeError = this.getSegmentError(value, {
			invalidCharsMessage: options.invalidCharsMessage,
			isWithinRange: (day) => this.isDayInRange(day),
			rangeMessage: DAY_RANGE_ERROR,
		});
		if (rangeError) return rangeError;

		// Only cross-check the day against the month when the month is itself a
		// valid month; when it is not (e.g. "0" or "13"), the error belongs to the
		// month field, so we must not mislabel it as a day-for-month problem.
		if (
			value.length === 2 &&
			this.isResolvableMonth(month) &&
			!this.isValidDay(value, year, month)
		) {
			return INVALID_DAY_FOR_MONTH_ERROR;
		}

		return null;
	}

	// The plain 1–31 numeric range, independent of month/year — the first tier of
	// getDayError, kept separate from the calendar check so an out-of-range day
	// and a day that does not exist in the month get different messages.
	private isDayInRange(value: string): boolean {
		const dayNumber = parseInt(value, 10);
		return dayNumber >= 1 && dayNumber <= 31;
	}

	// A month that resolves to a real 1–12 value (single digit or two digits).
	// Used to gate the day-for-month check so an invalid month does not surface
	// as a day error.
	private isResolvableMonth(month: string): boolean {
		if (!/^\d{1,2}$/.test(month)) return false;
		const monthNumber = parseInt(month, 10);
		return monthNumber >= 1 && monthNumber <= 12;
	}
}
