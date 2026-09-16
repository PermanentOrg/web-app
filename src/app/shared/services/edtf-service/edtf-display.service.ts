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
	/** The value, or the start of a range together with its dash. */
	date: EdtfDisplaySegment[];
	/** The end of a range, so it can wrap onto its own line. Empty otherwise. */
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

const EMPTY_DISPLAY_TEXT: EdtfDisplayText = { date: [], dateEnd: [], time: [] };

type IntervalMergeLevel = 'day' | 'month' | 'year' | 'none';

interface EdtfIntervalSide {
	date: DateModel;
	dateText: string;
	timeText: string;
	timeTextWithSeconds: string;
	qualifierSymbol: string;
	isEmpty: boolean;
}

interface EdtfIntervalSides {
	isInterval: boolean;
	start: EdtfIntervalSide;
	end: EdtfIntervalSide | null;
}

function content(text: string): EdtfDisplaySegment {
	return { text, isAnnotation: false };
}

function annotation(text: string): EdtfDisplaySegment {
	return { text, isAnnotation: true };
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
		// A lone '0' day is an unfinished value ('05' minus a keystroke), so it
		// is treated as absent rather than guessed at.
		const hasDay = !!dayValue && parseInt(dayValue, 10) !== 0;

		if (!hasYear && !hasMonth && !hasDay) {
			return '';
		}

		const yearDisplay = this.edtfService.padWithX(yearValue, 4);
		const monthIndex = this.toMonthIndex(monthValue);

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

		const parts = [
			yearDisplay,
			hasMonth ? this.edtfService.padWithX(monthValue, 2) : 'XX',
		];
		if (hasDay) {
			parts.push(dayValue.padStart(2, '0'));
		}
		return parts.join('-');
	}

	formatForDisplay(displayTime: string | null | undefined): EdtfDisplayText {
		if (!displayTime) {
			return EMPTY_DISPLAY_TEXT;
		}

		const sides = this.toIntervalSides(displayTime);

		if (!sides) {
			return { ...EMPTY_DISPLAY_TEXT, date: [content(displayTime)] };
		}

		return sides.end
			? this.buildInterval(sides.start, sides.end)
			: this.buildSingleValue(sides.start);
	}

	/**
	 * The full value for a range whose times the row does not show, or null for
	 * anything else — a single value shows its own time, and a range inside one
	 * day shows both of them.
	 */
	formatForTooltip(
		displayTime: string | null | undefined,
	): EdtfTooltipText | null {
		const sides = this.toIntervalSides(displayTime);
		if (!sides) {
			return null;
		}

		const { start, end } = sides;
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

	private toIntervalSides(
		displayTime: string | null | undefined,
	): EdtfIntervalSides | null {
		const model = this.parseOrNull(displayTime);

		if (!model) {
			return null;
		}

		const isInterval = !!displayTime?.includes('/');

		return {
			isInterval,
			start: this.toIntervalSide(model.qualifiers, model.date, model.time),
			end: isInterval
				? this.toIntervalSide(model.endQualifiers, model.endDate, model.endTime)
				: null,
		};
	}

	private toFullText(side: EdtfIntervalSide): string {
		if (side.isEmpty) {
			return UNKNOWN_LABEL;
		}
		const dateText = `${side.dateText}${side.qualifierSymbol ? ` ${side.qualifierSymbol}` : ''}`;
		return side.timeTextWithSeconds
			? `${dateText}${SEPARATOR} ${side.timeTextWithSeconds}`
			: dateText;
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

	private toQualifierSymbol(
		qualifiers: DateQualifierFlags | undefined,
	): string {
		if (qualifiers?.approximate && qualifiers?.uncertain) return '%';
		if (qualifiers?.approximate) return '~';
		if (qualifiers?.uncertain) return '?';
		return '';
	}

	private toIntervalSide(
		qualifiers: DateQualifierFlags | undefined,
		date: DateModel | undefined,
		time: TimeModel | undefined,
	): EdtfIntervalSide {
		const hasAnyDatePart = !!(date?.year || date?.month || date?.day);
		const isEmpty = !!qualifiers?.unknown || !hasAnyDatePart;

		return {
			date: date ?? { year: '' },
			dateText: isEmpty
				? ''
				: this.formatDateForDisplay(date, FILE_LIST_DATE_OPTIONS),
			timeText: this.formatTimeForDisplay(time),
			timeTextWithSeconds: this.formatTimeForDisplay(time, true),
			qualifierSymbol: this.toQualifierSymbol(qualifiers),
			isEmpty,
		};
	}

	private buildSingleValue(side: EdtfIntervalSide): EdtfDisplayText {
		if (side.isEmpty) {
			return { ...EMPTY_DISPLAY_TEXT, date: [annotation(UNKNOWN_LABEL)] };
		}

		return {
			...EMPTY_DISPLAY_TEXT,
			date: joinSegments([
				content(side.dateText),
				...this.qualifierSegments(side),
			]),
			time: side.timeText ? [content(side.timeText)] : [],
		};
	}

	private buildInterval(
		start: EdtfIntervalSide,
		end: EdtfIntervalSide,
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
					content(end.dateText),
					...this.qualifierSegments(end),
				]),
			};
		}

		if (end.isEmpty) {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					annotation(OPEN_END_PREFIX),
					content(start.dateText),
					...this.qualifierSegments(start),
				]),
			};
		}

		return this.buildClosedInterval(start, end);
	}

	private buildClosedInterval(
		start: EdtfIntervalSide,
		end: EdtfIntervalSide,
	): EdtfDisplayText {
		const mergeLevel = this.intervalMergeLevel(start.date, end.date);

		if (mergeLevel === 'day') {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					content(start.dateText),
					...this.qualifierSegments(start),
					...this.qualifierSegments(end),
				]),
				time: this.buildTimeRange(start, end),
			};
		}

		if (mergeLevel === 'none') {
			return {
				...EMPTY_DISPLAY_TEXT,
				date: joinSegments([
					content(start.dateText),
					...this.qualifierSegments(start),
					content(RANGE_SEPARATOR),
				]),
				dateEnd: joinSegments([
					content(end.dateText),
					...this.qualifierSegments(end),
				]),
			};
		}

		const endLabel =
			mergeLevel === 'month'
				? this.withoutLeadingZeros(end.date.day)
				: this.monthAndDayLabel(end.date);

		return {
			...EMPTY_DISPLAY_TEXT,
			date: joinSegments([
				content(this.monthAndDayLabel(start.date)),
				...this.qualifierSegments(start),
				content(RANGE_SEPARATOR),
			]),
			dateEnd: joinSegments([
				content(endLabel),
				...this.qualifierSegments(end),
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
			this.toMonthIndex(date.month ?? '') !== NO_MONTH_INDEX
		);
	}

	private buildTimeRange(
		start: EdtfIntervalSide,
		end: EdtfIntervalSide,
	): EdtfDisplaySegment[] {
		if (start.timeText && end.timeText) {
			return [content(`${start.timeText}${RANGE_SEPARATOR} ${end.timeText}`)];
		}
		const singleTime = start.timeText || end.timeText;
		return singleTime ? [content(singleTime)] : [];
	}

	private qualifierSegments(side: EdtfIntervalSide): EdtfDisplaySegment[] {
		return side.qualifierSymbol ? [annotation(` ${side.qualifierSymbol}`)] : [];
	}

	private monthAndDayLabel(date: DateModel): string {
		const monthName = this.abbreviatedMonthName(this.toMonthIndex(date.month));
		return `${monthName} ${this.withoutLeadingZeros(date.day)}`;
	}

	private formatTimeForDisplay(
		time: TimeModel | undefined,
		withSeconds = false,
	): string {
		const hours = time?.hours ?? '';
		if (!hours) {
			return '';
		}

		const minutes = (time.minutes || '00').padStart(2, '0');
		const seconds = withSeconds
			? `:${(time.seconds || '00').padStart(2, '0')}`
			: '';

		if (time.format === 'h24') {
			return `${hours.padStart(2, '0')}:${minutes}${seconds}`;
		}

		return `${this.withoutLeadingZeros(hours)}:${minutes}${seconds} ${TIME_FORMAT_LABEL[time.format]}`;
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
