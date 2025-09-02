import { DataItem, DateType } from 'vis-timeline/standalone';
import moment from 'moment';
import { RecordVO, FolderVO, ItemVO, TimezoneVOData } from '@models';
import { groupBy, minBy, maxBy, meanBy } from 'lodash';
import { isMobileWidth } from '@shared/services/device/device.service';

export const Minute = 1000 * 60;
export const Hour = Minute * 60;
export const Day = Hour * 24;
export const Month = Day * 30;
export const Year = Month * 12;

export type TimelineItemDataType = 'record' | 'folder' | 'group';

export enum TimelineGroupTimespan {
	Century,
	Decade,
	Year,
	Month,
	Day,
	Hour,
	Item,
}

export interface TimelineDataItem {
	dataType: TimelineItemDataType;
}

const TimelineItemClasses = [
	'timeline-perm-orange',
	'timeline-perm-blue',
	'timeline-perm-purple',
];

let timelineItemClassCounter = 0;

function getAlternatingTimelineItemClass() {
	return TimelineItemClasses[
		timelineItemClassCounter++ % TimelineItemClasses.length
	];
}

function getEvenSpreadItems(items: any[], count = 4) {
	const length = items.length;
	const last = length - 1;
	const spread = [];
	if (!items.length) {
		return spread;
	}

	if (items.length <= 4) {
		return items;
	}

	spread.push(items[0]);

	const middleCount = count - 2;
	const step = length / (count - 1);

	let current = 0;
	for (let x = 1; x <= middleCount; x++) {
		current = current + step;
		const rounded = Math.round(current);
		spread.push(items[rounded]);
	}

	spread.push(items[last]);

	return spread;
}

const imageHeight = 40;
const recordImageHeight = 100;

export class TimelineItem implements DataItem, TimelineDataItem {
	content: string;
	className: string;
	start: number;
	end?: number;
	type: 'box';
	dataType: TimelineItemDataType;
	item: ItemVO;

	recordType?: string;
	imageWidth?: string;
	imageHeight?: string;

	constructor(item: ItemVO, timezone: TimezoneVOData = null) {
		this.item = item;
		this.content = item.displayName;
		this.className = getAlternatingTimelineItemClass();
		this.start = getTimezoneDateFromDisplayDate(
			item.displayDT,
			timezone,
		).valueOf();

		if (item instanceof FolderVO) {
			this.dataType = 'folder';
			this.imageWidth = `${imageHeight}px`;
			const end = getTimezoneDateFromDisplayDate(
				item.displayEndDT,
				timezone,
			).valueOf();
			if (end - this.start > 6 * Month) {
				this.end = end;
			}
		} else {
			this.dataType = 'record';
			const height = isMobileWidth() ? imageHeight : recordImageHeight;
			this.imageHeight = `${height}px`;
			this.imageWidth = `${
				height * (item.imageRatio ? 1 / Number(item.imageRatio) : 1)
			}px`;
		}
	}
}

export class TimelineGroup implements DataItem, TimelineDataItem {
	content: string;
	className: string;
	start: number;
	end: number;
	dataType: TimelineItemDataType = 'group';
	type?: string;
	groupStart: number;
	groupEnd: number;
	groupTimespan: TimelineGroupTimespan;
	groupItems: RecordVO[] = [];
	previewThumbs: string[] = [];
	groupName: string;

	constructor(
		items: RecordVO[],
		timespan: TimelineGroupTimespan,
		name: string,
		timezone: TimezoneVOData = null,
	) {
		this.groupItems = items;
		this.previewThumbs = getEvenSpreadItems(items.map((i) => i.thumbURL200));
		this.groupTimespan = timespan;
		this.groupName = name;
		this.content = name;
		this.className = getAlternatingTimelineItemClass();
		this.groupStart = moment
			.utc(minBy(items, (item) => item.displayDT).displayDT)
			.valueOf();
		this.groupEnd = moment
			.utc(maxBy(items, (item) => item.displayDT).displayDT)
			.valueOf();
		const diff = this.groupEnd - this.groupStart;
		let minDiffForRange = 20 * Minute;
		let neverRange = true;

		switch (timespan) {
			case TimelineGroupTimespan.Year:
				neverRange = true;
				break;
			case TimelineGroupTimespan.Month:
				minDiffForRange = 10 * Day;
				break;
			case TimelineGroupTimespan.Day:
				minDiffForRange = 12 * Hour;
				break;
		}

		if (diff >= minDiffForRange && !neverRange) {
			this.start = getTimezoneDateFromDisplayDate(
				this.groupStart,
				timezone,
			).valueOf();
			this.end = getTimezoneDateFromDisplayDate(
				this.groupEnd,
				timezone,
			).valueOf();
		} else {
			this.start = getTimezoneDateFromDisplayDate(
				meanBy(this.groupItems, (i) => new Date(i.displayDT).valueOf()),
				timezone,
			).valueOf();
		}
	}
}

function getTimezoneDateFromDisplayDate(
	displayDate: string | number,
	timezone: TimezoneVOData = null,
) {
	const m = moment.utc(displayDate);
	if (!timezone) {
		return m;
	}

	let offset;

	if (m.isDST()) {
		offset = timezone.dstOffset;
	} else {
		offset = timezone.stdOffset;
	}

	const offsetMinutes = moment().utcOffset(offset).utcOffset();
	return m.add(offsetMinutes, 'minutes');
}

export function GroupByTimespan(
	items: ItemVO[],
	timespan: TimelineGroupTimespan,
	bestFit = false,
	timezone: TimezoneVOData = null,
) {
	const timelineItems: (TimelineGroup | TimelineItem)[] = [];
	const records: RecordVO[] = [];
	const minimumGroupCount = 20;

	if (bestFit) {
		const bestFitTimespan = getBestFitTimespanForItems(items);
		timespan = bestFitTimespan;
	}

	for (const item of items) {
		if (item instanceof FolderVO) {
			timelineItems.push(new TimelineItem(item));
		} else {
			records.push(item);
		}
	}

	if (timespan === TimelineGroupTimespan.Item) {
		timelineItems.push(...records.map((r) => new TimelineItem(r)));
	} else {
		const groups = groupBy(records, (record) => {
			const groupFormat = getDateGroupFormatFromTimespan(timespan);
			const displayFormat = getDisplayDateFormatFromTimespan(timespan);
			const date = getTimezoneDateFromDisplayDate(record.displayDT, timezone);
			if (timespan >= TimelineGroupTimespan.Year) {
				return date.format(`${groupFormat}[.]${displayFormat}`);
			} else {
				let group = date.format('YYYY');
				switch (timespan) {
					case TimelineGroupTimespan.Decade:
						group = `${group.substr(0, 3)}0`;
						break;
					case TimelineGroupTimespan.Century:
						group = `${group.substr(0, 2)}00`;
						break;
				}
				return `${group}.${group}s`;
			}
		});

		for (const key in groups) {
			if (groups.hasOwnProperty(key)) {
				const groupItems = groups[key];
				if (groupItems.length < minimumGroupCount) {
					timelineItems.push(...groupItems.map((i) => new TimelineItem(i)));
				} else {
					const parts = key.split('.');
					const timelineGroup = new TimelineGroup(
						groupItems,
						timespan,
						parts[1],
					);
					timelineItems.push(timelineGroup);
				}
			}
		}
	}

	return {
		groupedItems: timelineItems,
		timespan: timespan,
	};
}

export function GetTimespanFromRange(start: number, end: number) {
	const diff = end - start;
	if (diff > 160 * Year) {
		return TimelineGroupTimespan.Century;
	} else if (diff > 20 * Year) {
		return TimelineGroupTimespan.Decade;
	} else if (diff > 20 * Month) {
		return TimelineGroupTimespan.Year;
	} else if (diff > 40 * Day) {
		return TimelineGroupTimespan.Month;
	} else if (diff > 50 * Hour) {
		return TimelineGroupTimespan.Day;
	} else if (diff > 90 * Minute) {
		return TimelineGroupTimespan.Hour;
	} else {
		return TimelineGroupTimespan.Item;
	}
}

export function GetBreadcrumbsFromRange(start: number, end: number) {
	const range = end - start;
	const mid = moment.utc((start + end) / 2);
	const path = [];

	if (range <= Year * 1.05) {
		path.push(
			mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Year)),
		);
	}

	if (range <= Month + Day) {
		path.push(
			mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Month)),
		);
	}

	if (range <= Day + Hour) {
		path.push(
			mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Day)),
		);
	}

	if (range <= Hour + 5 * Minute) {
		path.push(
			mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Hour)),
		);
	}

	return path;
}

function getDateGroupFormatFromTimespan(
	timespan: TimelineGroupTimespan,
): string {
	switch (timespan) {
		case TimelineGroupTimespan.Year:
			return 'YYYY';
		case TimelineGroupTimespan.Month:
			return 'YYYY-MM';
		case TimelineGroupTimespan.Day:
			return 'YYYY-MM-DD';
		case TimelineGroupTimespan.Hour:
			return 'YYYY-MM-DD HH';
	}
}

function getDisplayDateFormatFromTimespan(
	timespan: TimelineGroupTimespan,
): string {
	switch (timespan) {
		case TimelineGroupTimespan.Year:
		case TimelineGroupTimespan.Decade:
		case TimelineGroupTimespan.Century:
			return 'YYYY';
		case TimelineGroupTimespan.Month:
			return 'MMMM YYYY';
		case TimelineGroupTimespan.Day:
			return 'MMMM Do';
		case TimelineGroupTimespan.Hour:
			return 'h A';
	}
}

export function getBestFitTimespanForItems(
	items: ItemVO[],
): TimelineGroupTimespan {
	if (!items || !items.length) {
		return TimelineGroupTimespan.Year;
	}

	const start = moment
		.utc(minBy(items, (item) => item.displayDT).displayDT)
		.valueOf();
	const endItem = maxBy(items, (item) => item.displayEndDT || item.displayDT);
	const end = moment.utc(endItem.displayEndDT || endItem.displayDT).valueOf();

	return GetTimespanFromRange(start, end);
}

export function dateTypeToNumber(date: DateType): number {
	if (typeof date === 'number') {
		return date;
	} else if (typeof date === 'string') {
		return parseFloat(date);
	} else {
		return date.getTime();
	}
}
