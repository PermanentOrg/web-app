import { Injectable } from '@angular/core';
import edtf, { Date, Interval } from 'edtf';

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
	toDateTimeModel(edtfString: string): DateTimeModel {
		const { timezoneOffset, timezoneName } = this.extractTimezone(edtfString);
		const edtfObject = edtf(edtfString) as Date;

		if (edtfObject instanceof Interval) {
			return this.intervalToDateTimeModel(
				edtfObject,
				timezoneOffset,
				timezoneName,
			);
		}

		return this.extDateToDateTimeModel(
			edtfObject,
			timezoneOffset,
			timezoneName,
		);
	}

	toEdtfDate(model: DateTimeModel): string {
		const { date, time, qualifiers, endDate, endTime } = model;

		const dateStr = this.buildDateString(date);
		const timeStr = this.buildTimeString(time);
		const timezone = time.timezoneOffset || '';

		// Append Z when time is present so edtf() treats values as UTC
		// and doesn't convert from local time
		const utcSuffix = timeStr ? 'Z' : '';

		let rawString = `${dateStr}${timeStr}${utcSuffix}`;

		if (qualifiers?.approximate && qualifiers?.uncertain) {
			rawString = `${dateStr}%${timeStr}${utcSuffix}`;
		} else if (qualifiers?.approximate) {
			rawString = `${dateStr}~${timeStr}${utcSuffix}`;
		} else if (qualifiers?.uncertain) {
			rawString = `${dateStr}?${timeStr}${utcSuffix}`;
		}

		if (endDate) {
			const endDateStr = this.buildDateString(endDate);
			const endTimeStr = this.buildTimeString(endTime);
			const endUtcSuffix = endTimeStr ? 'Z' : '';

			rawString += `/${endDateStr}${endTimeStr}${endUtcSuffix}`;
		}

		const edtfObject = edtf(rawString);
		let edtfString = edtfObject.toEDTF();

		// Remove the trailing Z/.000Z that edtf() adds, since we append
		// the actual timezone separately
		if (timeStr) {
			edtfString = edtfString.replace(/\.000Z$/g, '').replace(/Z$/g, '');
		}

		return timezone ? `${edtfString}${timezone}` : edtfString;
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

		return `T${String(hours24).padStart(2, '0')}:${time.minutes}:${time.seconds}`;
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

		const hasMonth = precision >= 2;
		const hasDay = precision >= 3;

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

		const hasTime = precision === 0 || edtfStr.includes('T');
		const hours24 = extDate.hours;
		const isPm = hours24 >= 12;
		const hours12 = hours24 % 12 || 12;

		return {
			qualifiers: {
				approximate: extDate.approximate?.value > 0,
				uncertain: extDate.uncertain?.value > 0,
				unknown: extDate.unspecified?.value > 0,
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

	private intervalToDateTimeModel(
		interval: Interval,
		timezoneOffset: string,
		timezoneName: string,
	): DateTimeModel {
		const lower = interval.lower;
		const upper = interval.upper;

		const model = this.extDateToDateTimeModel(
			lower,
			timezoneOffset,
			timezoneName,
		);

		if (upper) {
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
