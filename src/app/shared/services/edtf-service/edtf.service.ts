import { Injectable } from '@angular/core';
import edtf, { Date, Interval } from 'edtf';

export enum EdtfPrecision {
	Time = 0,
	Year = 1,
	Month = 2,
	Day = 3,
}

export interface DateQualifier {
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
	qualifiers?: DateQualifier;
	date: DateModel;
	time: TimeModel;
	endDate?: DateModel;
	endTime?: TimeModel;
}

@Injectable({
	providedIn: 'root',
})
export class EdtfService {
	toDateTimeModel(edtfString: string): DateTimeModel | null {
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
		qualifiers?: DateQualifier,
	): string {
		const dateStr = this.buildDateString(date);
		const timeStr = this.buildTimeString(time);
		const utcSuffix = timeStr ? 'Z' : '';

		if (qualifiers?.approximate && qualifiers?.uncertain) {
			return `${dateStr}%${timeStr}${utcSuffix}`;
		} else if (qualifiers?.approximate) {
			return `${dateStr}~${timeStr}${utcSuffix}`;
		} else if (qualifiers?.uncertain) {
			return `${dateStr}?${timeStr}${utcSuffix}`;
		}

		return `${dateStr}${timeStr}${utcSuffix}`;
	}

	private normalizeEdtfString(
		date: DateModel,
		time: TimeModel,
		qualifiers?: DateQualifier,
	): string {
		const rawString = this.buildRawEdtfString(date, time, qualifiers);
		const timeStr = this.buildTimeString(time);
		const timezone = time?.timezoneOffset || '';

		const edtfObject = edtf(rawString);
		let edtfString = edtfObject.toEDTF();

		if (timeStr) {
			edtfString = edtfString.replace(/\.000Z$/g, '').replace(/Z$/g, '');
		}

		return timezone ? `${edtfString}${timezone}` : edtfString;
	}

	private buildDateString(date: DateModel): string {
		const year = date.year.padEnd(4, 'X');

		if (!date.month) {
			return year;
		}

		if (!date.day) {
			return `${year}-${date.month}`;
		}

		return `${year}-${date.month}-${date.day}`;
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
}
