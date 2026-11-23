import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import {
	DateModel,
	DateQualifierFlags,
	DateTimeModel,
	EdtfService,
	TIME_FORMAT_LABEL,
	TimeModel,
} from './edtf.service';

export interface EdtfDisplaySegment {
	text: string;
	isAnnotation: boolean;
}

export interface EdtfDisplayText {
	date: EdtfDisplaySegment[];
	dateEnd: EdtfDisplaySegment[];
	time: EdtfDisplaySegment[];
}

export interface EdtfTooltipText {
	from: string;
	to: string;
}

export interface DateDisplayOptions {
	abbreviateMonthWithDay: boolean;
	padSingleDigitDay: boolean;
}

export const SIDEBAR_PICKER_DATE_OPTIONS: DateDisplayOptions = {
	abbreviateMonthWithDay: false,
	padSingleDigitDay: true,
};

export const FILE_LIST_DATE_OPTIONS: DateDisplayOptions = {
	abbreviateMonthWithDay: true,
	padSingleDigitDay: false,
};

const MONTHS_IN_YEAR = 12;

const UNKNOWN_LABEL = 'Unknown';
const OPEN_START_PREFIX = 'Before ';
const OPEN_END_PREFIX = 'After ';
const RANGE_SEPARATOR = ' —';
const NO_MONTH_INDEX = -1;
const SEPARATOR = ' \u2022';
const APPROXIMATE_PREFIX = 'c. ';
const UNCERTAIN_SUFFIX = ' ?';

const EMPTY_DISPLAY_TEXT: EdtfDisplayText = { date: [], dateEnd: [], time: [] };

type IntervalMergeLevel = 'day' | 'month' | 'year' | 'none';

interface EdtfIntervalBound {
	date: DateModel;
	dateText: string;
	timeText: string;
	timeSegments: EdtfDisplaySegment[];
	timeTextWithSeconds: string;
	timezoneLabel: string;
	isApproximate: boolean;
	isUncertain: boolean;
	isEmpty: boolean;
}

interface EdtfIntervalBounds {
	isInterval: boolean;
	start: EdtfIntervalBound;
	end: EdtfIntervalBound | null;
}

function content(text: string): EdtfDisplaySegment {
	return { text, isAnnotation: false };
}

function annotation(text: string): EdtfDisplaySegment {
	return { text, isAnnotation: true };
}

function segmentsToText(segments: EdtfDisplaySegment[]): string {
	return segments.map((segment) => segment.text).join('');
}

function joinSegments(segments: EdtfDisplaySegment[]): EdtfDisplaySegment[] {
	return segments.reduce<EdtfDisplaySegment[]>((joined, segment) => {
		if (!segment.text) {
			return joined;
		}
		const previous = joined[joined.length - 1];
		if (previous && previous.isAnnotation === segment.isAnnotation) {
			previous.text += segment.text;
			return joined;
		}
		joined.push({ ...segment });
		return joined;
	}, []);
}

@Injectable({
	providedIn: 'root',
})
export class EdtfDisplayService {
	private readonly edtfService = inject(EdtfService);

	formatDateForDisplay(
		date: DateModel,
		options: DateDisplayOptions = SIDEBAR_PICKER_DATE_OPTIONS,
	): string {
		const yearValue = date?.year ?? '';
		const monthValue = date?.month ?? '';
		const dayValue = date?.day ?? '';

		const hasYear = !!yearValue;
		const hasMonth = !!monthValue;
		// A lone '0' day is a half-typed value, so treat it as absent.
		const hasDay = !!dayValue && parseInt(dayValue, 10) !== 0;

		if (!hasYear && !hasMonth && !hasDay) {
			return '';
		}

		const yearDisplay = this.edtfService.padWithX(yearValue, 4);
		const monthDisplay = hasMonth
			? this.edtfService.padMonthOrDay(monthValue)
			: 'XX';
		const monthIndex = this.toMonthIndex(monthDisplay);

		if (monthIndex !== NO_MONTH_INDEX && hasDay) {
			const monthName = options.abbreviateMonthWithDay
				? this.abbreviatedMonthName(monthIndex)
				: this.fullMonthName(monthIndex);
			const dayDisplay = options.padSingleDigitDay
				? dayValue.padStart(2, '0')
				: this.withoutLeadingZeros(dayValue);
			return `${monthName} ${dayDisplay}, ${yearDisplay}`;
		}

		if (monthIndex !== NO_MONTH_INDEX) {
			return `${this.fullMonthName(monthIndex)} ${yearDisplay}`;
		}

		if (!hasMonth && !hasDay) {
			return yearDisplay;
		}

		const parts = [yearDisplay, monthDisplay];
		if (hasDay) {
			parts.push(dayValue.padStart(2, '0'));
		}
		return parts.join('-');
	}

	formatForDisplay(
		displayTime: string | null | undefined,
		timezone?: string | null,
	): EdtfDisplayText {
		if (!displayTime) {
			return EMPTY_DISPLAY_TEXT;
		}

		const bounds = this.toIntervalBounds(displayTime, timezone);

		if (!bounds) {
			return { ...EMPTY_DISPLAY_TEXT, date: [content(displayTime)] };
		}

		return bounds.end
			? this.buildInterval(bounds.start, bounds.end)
			: this.buildSingleValue(bounds.start);
	}

	formatForTooltip(
		displayTime: string | null | undefined,
		timezone?: string | null,
	): EdtfTooltipText | null {
		const bounds = this.toIntervalBounds(displayTime, timezone);
		if (!bounds) {
			return null;
		}

		const { start, end } = bounds;
		const showsItsTimes =
			!end || this.intervalMergeLevel(start.date, end.date) === 'day';

		if (showsItsTimes || !(start.timeText || end.timeText)) {
			return null;
		}

		return { from: this.toFullText(start), to: this.toFullText(end) };
	}

	formatToPlainText(displayTime: string | null | undefined): string {
		const rendered = this.formatForDisplay(displayTime);
		return [...rendered.date, ...rendered.dateEnd]
			.map((segment) => segment.text)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private toIntervalBounds(
		displayTime: string | null | undefined,
		timezone: string | null | undefined,
	): EdtfIntervalBounds | null {
		const model = this.parseOrNull(displayTime);

		if (!model) {
			return null;
		}

		const isInterval = !!displayTime?.includes('/');

		return {
			isInterval,
			start: this.toIntervalBound(
				model.qualifiers,
				model.date,
				model.time,
				timezone,
			),
			end: isInterval
				? this.toIntervalBound(
						model.endQualifiers,
						model.endDate,
						model.endTime,
						timezone,
					)
				: null,
		};
	}

	private toFullText(bound: EdtfIntervalBound): string {
		if (bound.isEmpty) {
			return UNKNOWN_LABEL;
		}
		const dateText = segmentsToText(this.qualifiedBoundSegments(bound));
		if (!bound.timeTextWithSeconds) {
			return dateText;
		}
		const timezoneSuffix = bound.timezoneLabel ? ` ${bound.timezoneLabel}` : '';
		return `${dateText}${SEPARATOR} ${bound.timeTextWithSeconds}${timezoneSuffix}`;
	}

	private parseOrNull(
		edtfString: string | null | undefined,
	): DateTimeModel | null {
		try {
			return this.edtfService.toDateTimeModel(edtfString ?? '');
		} catch {
			return null;
		}
	}

	private toIntervalBound(
		qualifiers: DateQualifierFlags | undefined,
		date: DateModel | undefined,
		time: TimeModel | undefined,
		timezone: string | null | undefined,
	): EdtfIntervalBound {
		const hasAnyDatePart = !!(date?.year || date?.month || date?.day);
		const isEmpty = !!qualifiers?.unknown || !hasAnyDatePart;
		const timeSegments = this.formatTimeSegments(time);

		return {
			date: date ?? { year: '' },
			dateText: isEmpty
				? ''
				: this.formatDateForDisplay(date, FILE_LIST_DATE_OPTIONS),
			timeText: segmentsToText(timeSegments),
			timeSegments,
			timeTextWithSeconds: segmentsToText(this.formatTimeSegments(time, true)),
			timezoneLabel:
				this.edtfService.getTimezoneAbbreviation(date, time, timezone) ?? '',
			isApproximate: !!qualifiers?.approximate,
			isUncertain: !!qualifiers?.uncertain,
			isEmpty,
		};
	}

	private buildSingleValue(bound: EdtfIntervalBound): EdtfDisplayText {
		if (bound.isEmpty) {
			return { ...EMPTY_DISPLAY_TEXT, date: [annotation(UNKNOWN_LABEL)] };
		}

		return {
			...EMPTY_DISPLAY_TEXT,
			date: joinSegments(this.qualifiedBoundSegments(bound)),
			time: bound.timeText
				? joinSegments([
						...bound.timeSegments,
						...this.timezoneSegments(bound.timezoneLabel),
					])
				: [],
		};
	}

	private buildInterval(
		start: EdtfIntervalBound,
		end: EdtfIntervalBound,
	): EdtfDisplayText {
		if (start.isEmpty && end.isEmpty) {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: [annotation(UNKNOWN_LABEL), content(RANGE_SEPARATOR)],
				dateEnd: [annotation(UNKNOWN_LABEL)],
			};
		}

		if (start.isEmpty) {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					annotation(OPEN_START_PREFIX),
					...this.qualifiedBoundSegments(end),
				]),
			};
		}

		if (end.isEmpty) {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					annotation(OPEN_END_PREFIX),
					...this.qualifiedBoundSegments(start),
				]),
			};
		}

		return this.buildClosedInterval(start, end);
	}

	private buildClosedInterval(
		start: EdtfIntervalBound,
		end: EdtfIntervalBound,
	): EdtfDisplayText {
		const mergeLevel = this.intervalMergeLevel(start.date, end.date);

		if (mergeLevel === 'day') {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments(
					this.qualifiedSegments(
						start.dateText,
						start.isApproximate || end.isApproximate,
						start.isUncertain || end.isUncertain,
					),
				),
				time: this.buildTimeRange(start, end),
			};
		}

		if (
			mergeLevel === 'none' ||
			this.isQualified(start) ||
			this.isQualified(end)
		) {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					...this.qualifiedBoundSegments(start),
					content(RANGE_SEPARATOR),
				]),
				dateEnd: joinSegments(this.qualifiedBoundSegments(end)),
			};
		}

		const endLabel =
			mergeLevel === 'month'
				? this.withoutLeadingZeros(end.date.day)
				: this.monthAndDayLabel(end.date);

		return {
			...EMPTY_DISPLAY_TEXT,
			date: joinSegments([
				...this.qualifiedBoundSegments(
					start,
					this.monthAndDayLabel(start.date),
				),
				content(RANGE_SEPARATOR),
			]),
			dateEnd: joinSegments([
				...this.qualifiedBoundSegments(end, endLabel),
				content(`, ${this.edtfService.padWithX(start.date.year, 4)}`),
			]),
		};
	}

	private intervalMergeLevel(
		start: DateModel,
		end: DateModel,
	): IntervalMergeLevel {
		if (!this.isMergeable(start) || !this.isMergeable(end)) {
			return 'none';
		}
		if (start.year !== end.year) {
			return 'none';
		}
		if (start.month !== end.month) {
			return 'year';
		}
		if (start.day !== end.day) {
			return 'month';
		}
		return 'day';
	}

	private isMergeable(date: DateModel): boolean {
		return (
			!!date.year &&
			!!date.day &&
			this.toMonthIndex(date.month) !== NO_MONTH_INDEX
		);
	}

	private buildTimeRange(
		start: EdtfIntervalBound,
		end: EdtfIntervalBound,
	): EdtfDisplaySegment[] {
		if (start.timeText && end.timeText) {
			return joinSegments([
				...start.timeSegments,
				...this.timezoneSegments(this.distinctStartTimezoneLabel(start, end)),
				content(`${RANGE_SEPARATOR} `),
				...end.timeSegments,
				...this.timezoneSegments(end.timezoneLabel || start.timezoneLabel),
			]);
		}
		const boundWithTime = start.timeText ? start : end;
		return joinSegments([
			...boundWithTime.timeSegments,
			...this.timezoneSegments(boundWithTime.timezoneLabel),
		]);
	}

	private distinctStartTimezoneLabel(
		start: EdtfIntervalBound,
		end: EdtfIntervalBound,
	): string {
		const isLabelSharedByBothBounds =
			!end.timezoneLabel || start.timezoneLabel === end.timezoneLabel;
		return isLabelSharedByBothBounds ? '' : start.timezoneLabel;
	}

	private timezoneSegments(timezoneLabel: string): EdtfDisplaySegment[] {
		return timezoneLabel ? [annotation(` ${timezoneLabel}`)] : [];
	}

	private isQualified(bound: EdtfIntervalBound): boolean {
		return bound.isApproximate || bound.isUncertain;
	}

	private qualifiedBoundSegments(
		bound: EdtfIntervalBound,
		dateLabel = bound.dateText,
	): EdtfDisplaySegment[] {
		return this.qualifiedSegments(
			dateLabel,
			bound.isApproximate,
			bound.isUncertain,
		);
	}

	private qualifiedSegments(
		dateLabel: string,
		isApproximate: boolean,
		isUncertain: boolean,
	): EdtfDisplaySegment[] {
		return [
			...(isApproximate ? [annotation(APPROXIMATE_PREFIX)] : []),
			content(dateLabel),
			...(isUncertain ? [annotation(UNCERTAIN_SUFFIX)] : []),
		];
	}

	private monthAndDayLabel(date: DateModel): string {
		const monthName = this.abbreviatedMonthName(this.toMonthIndex(date.month));
		return `${monthName} ${this.withoutLeadingZeros(date.day)}`;
	}

	private formatTimeSegments(
		time: TimeModel | undefined,
		withSeconds = false,
	): EdtfDisplaySegment[] {
		const hours = time?.hours ?? '';
		if (!hours) {
			return [];
		}

		const minutes = (time.minutes || '00').padStart(2, '0');
		const seconds = withSeconds
			? `:${(time.seconds || '00').padStart(2, '0')}`
			: '';

		if (time.format === 'h24') {
			return [content(`${hours.padStart(2, '0')}:${minutes}${seconds}`)];
		}

		return [
			content(`${this.withoutLeadingZeros(hours)}:${minutes}${seconds}`),
			annotation(` ${TIME_FORMAT_LABEL[time.format]}`),
		];
	}

	private toMonthIndex(month: string | undefined): number {
		if (!/^\d{2}$/.test(month ?? '')) {
			return NO_MONTH_INDEX;
		}
		const monthIndex = parseInt(month, 10) - 1;
		return monthIndex >= 0 && monthIndex < MONTHS_IN_YEAR
			? monthIndex
			: NO_MONTH_INDEX;
	}

	private fullMonthName(monthIndex: number): string {
		return format(new Date(2000, monthIndex), 'MMMM');
	}

	private abbreviatedMonthName(monthIndex: number): string {
		const abbreviated = format(new Date(2000, monthIndex), 'MMM');
		return abbreviated === this.fullMonthName(monthIndex)
			? abbreviated
			: `${abbreviated}.`;
	}

	private withoutLeadingZeros(value: string | undefined): string {
		return (value ?? '').replace(/^0+(?=\d)/, '');
	}
}
