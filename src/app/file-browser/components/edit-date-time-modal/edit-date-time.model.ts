import { Meridian } from '@shared/components/timepicker-input/timepicker-input.component';

export enum DateQualifier {
	Approximate = 'approximate',
	Uncertain = 'uncertain',
	Unknown = 'unknown',
}

export interface DateQualifierObject {
	approximate: boolean;
	uncertain: boolean;
	unknown: boolean;
}

export interface DateObject {
	year: string;
	month: string;
	day: string;
}

export { Meridian };

export interface TimeObject {
	hours: string;
	minutes: string;
	seconds: string;
	amPm: Meridian;
	timezoneOffset: string;
	timezoneName: string;
}

export interface EditDateModel {
	qualifiers?: DateQualifierObject;
	date: DateObject;
	time: TimeObject;
	endDate?: DateObject;
	endTime?: TimeObject;
}
