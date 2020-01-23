import { DataItem, moment } from '@permanent.org/vis-timeline';
import { RecordVO, FolderVO, ItemVO } from '@models/index';
import { groupBy, minBy, maxBy, meanBy } from 'lodash';

export const Minute = 1000 * 60;
export const Hour = Minute * 60;
export const Day = Hour * 24;
export const Month = Day * 30;
export const Year = Month * 12;

export type TimelineItemDataType = 'record' | 'folder' | 'group';

export enum TimelineGroupTimespan {
  Year,
  Month,
  Day,
  Hour,
  Item
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
  // return TimelineItemClasses[Math.floor(Math.random() * TimelineItemClasses.length)];
  return TimelineItemClasses[timelineItemClassCounter++ % TimelineItemClasses.length];
}

export class TimelineItem implements DataItem, TimelineDataItem {
  content: string;
  className: string;
  start: number;
  end?: number;
  type: 'box';
  dataType: TimelineItemDataType;
  item: ItemVO;

  recordType?: string;

  constructor(item: ItemVO) {
    this.item = item;
    this.content = item.displayName;
    this.className = getAlternatingTimelineItemClass();
    this.start = new Date(item.displayDT).valueOf();

    if (item instanceof FolderVO) {
      this.dataType = 'folder';
      const end = new Date(item.displayEndDT).valueOf();
      if (end - this.start > 6 * Month) {
        this.end = end;
      }
    } else {
      this.dataType = 'record';
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

  constructor(items: RecordVO[], timespan: TimelineGroupTimespan, name: string) {
    this.groupItems = items;
    this.previewThumbs = items.slice(0, 4).map(i => i.thumbURL200);
    this.groupTimespan = timespan;
    this.groupName = name;
    this.content = name;
    this.className = getAlternatingTimelineItemClass();
    this.groupStart = new Date(minBy(items, item => item.displayDT).displayDT).valueOf();
    this.groupEnd = new Date(maxBy(items, item => item.displayDT).displayDT).valueOf();
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
      this.start = this.groupStart;
      this.end = this.groupEnd;
    } else {
      this.start = meanBy(this.groupItems, i => new Date(i.displayDT).valueOf());
    }
  }
}

export function GroupByTimespan(items: ItemVO[], timespan: TimelineGroupTimespan, bestFit = false) {
  const timelineItems: (TimelineGroup | TimelineItem)[] = [];
  const records: RecordVO[] = [];
  const minimumGroupCount = 2;

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
    timelineItems.push(...records.map(r => new TimelineItem(r)));
  } else {
    const groups = groupBy(records, record => {
      const groupFormat = getDateGroupFormatFromTimespan(timespan);
      const displayFormat = getDisplayDateFormatFromTimespan(timespan);
      return moment(record.displayDT).format(`${groupFormat}[.]${displayFormat}`);
    });

    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        const groupItems = groups[key];
        if (groupItems.length < minimumGroupCount) {
          timelineItems.push(...groupItems.map(i => new TimelineItem(i)));
        } else {
          const parts = key.split('.');
          const timelineGroup = new TimelineGroup(groupItems, timespan, parts[1]);
          timelineItems.push(timelineGroup);
        }
      }
    }
  }

  return {
    groupedItems: timelineItems,
    timespan: timespan
  };
}

export function GetTimespanFromRange(start: number, end: number) {
  const diff = end - start;
  if (diff > 20 * Month) {
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
  const mid = moment((start + end) / 2);
  const path = [];

  if (range <= Year * 1.05) {
    path.push(mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Year)));
  }

  if (range <= Month + Day) {
    path.push(mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Month)));
  }

  if (range <= Day + Hour) {
    path.push(mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Day)));
  }

  if (range <= Hour + 5 * Minute) {
    path.push(mid.format(getDisplayDateFormatFromTimespan(TimelineGroupTimespan.Hour)));
  }

  return path;
}

function getDateGroupFormatFromTimespan(timespan: TimelineGroupTimespan): string {
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

function getDisplayDateFormatFromTimespan(timespan: TimelineGroupTimespan): string {
  switch (timespan) {
    case TimelineGroupTimespan.Year:
      return 'YYYY';
    case TimelineGroupTimespan.Month:
      return 'MMMM YYYY';
    case TimelineGroupTimespan.Day:
      return 'MMMM Do';
    case TimelineGroupTimespan.Hour:
      return 'h A';
  }
}

export function getBestFitTimespanForItems(items: ItemVO[]): TimelineGroupTimespan {
  const start = moment(minBy(items, item => item.displayDT).displayDT).valueOf();
  const endItem = maxBy(items, item => item.displayEndDT || item.displayDT);
  const end = moment(endItem.displayEndDT || endItem.displayDT).valueOf();

  return GetTimespanFromRange(start, end);
}
