import moment from 'moment';
import { TimezoneVOData } from '@models/timezone-vo';

export function momentFormatNum(
	dt: moment.Moment,
	f: 'M' | 'D' | 'YYYY' | 'H' | 'm' | 's',
) {
	return Number(dt.format(f));
}

export const zeroPad = (num, places) => String(num).padStart(places, '0');

export function checkOffsetFormat(offset: string) {
	if (offset.length === 6) {
		return offset;
	}

	return offset[0] + '0' + offset.substr(1);
}

export function getUtcMomentFromDTString(dt: string, format?: string) {
	return moment.utc(dt, format);
}

export function getUtcMomentFromOffsetDTString(dt: string, format?: string) {
	return moment.parseZone(dt, format);
}

export function getOffsetMomentFromDTString(
	dt: string,
	timezoneVO?: TimezoneVOData,
) {
	const local = moment.utc(dt).local();
	if (!timezoneVO) {
		return local;
	}

	const offset = checkOffsetFormat(
		local.isDST() ? timezoneVO.dstOffset : timezoneVO.stdOffset,
	);
	return moment.utc(dt).utcOffset(offset);
}

export function applyTimezoneOffset(
	dtMoment: moment.Moment,
	timezoneVO?: TimezoneVOData,
) {
	if (!timezoneVO) {
		return dtMoment.local();
	}

	const offset = checkOffsetFormat(
		dtMoment.clone().local().isDST()
			? timezoneVO.dstOffset
			: timezoneVO.stdOffset,
	);
	return dtMoment.utcOffset(offset);
}

export function formatDateISOString(dtString: string) {
	if (!dtString) {
		return dtString;
	}

	if (dtString.includes('Z')) {
		return dtString;
	} else {
		const format = 'YYYY-MM-DD[T]HH:mm:ss.SSSSSS';
		return moment.utc(dtString, format).toISOString();
	}
}

export function getSQLDateTime(date: Date | moment.Moment) {
	return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function getFormattedDate(date: Date) {
	const month = date.toLocaleString('default', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}, ${year}`;
}
