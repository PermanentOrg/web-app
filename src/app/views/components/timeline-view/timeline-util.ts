import { DataItem, moment } from 'vis-timeline';
import { RecordVO, FolderVO, ItemVO } from '@models/index';
import { groupBy, minBy, maxBy } from 'lodash';

export type TimelineItemDataType = 'record' | 'folder' | 'group';

export enum TimelineGroupTimespan {
  Year,
  Month,
  Day,
  Hour
}

// type TimelineGroupTimespan = 'year' | 'month' | 'day' | 'hour';

export interface TimelineDataItem {
  dataType: TimelineItemDataType;
}

export class TimelineItem implements DataItem, TimelineDataItem {
  content: string;
  start: string | number;
  end?: string | number;
  dataType: TimelineItemDataType;
  item: ItemVO;

  constructor(item: ItemVO) {
    this.item = item;
    this.content = item.displayName;
    this.start = new Date(item.displayDT).valueOf();

    if (item instanceof FolderVO) {
      this.dataType = 'folder';
      this.end = new Date(item.displayEndDT).valueOf();
    } else {
      this.dataType = 'record';
    }
  }
}

export class TimelineGroup implements DataItem, TimelineDataItem {
  content: string;
  start: string | number;
  end: string | number;
  dataType: TimelineItemDataType = 'group';
  groupTimespan: TimelineGroupTimespan;
  groupItems: RecordVO[] = [];
  groupName: string;

  constructor(items: RecordVO[], timespan: TimelineGroupTimespan, name: string) {
    this.groupItems = items;
    this.groupTimespan = timespan;
    this.groupName = name;
    this.content = name;
    this.start = new Date(minBy(items, item => item.displayDT).displayDT).valueOf();
    this.end = new Date(maxBy(items, item => item.displayDT).displayDT).valueOf();
  }
}

function getDateFormatFromTimespan(timespan: TimelineGroupTimespan): string {
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

function getBestFitTimespanForItems(items: ItemVO[]): TimelineGroupTimespan {
  const start = moment(minBy(items, item => item.displayDT).displayDT);
  const endItem = maxBy(items, item => item.displayEndDT || item.displayDT);
  const end = moment(endItem.displayEndDT || endItem.displayDT);
  const diff = end.diff(start);
  const hours = diff / (1000 * 60 * 60);
  const days = hours / 24;
  const months = days / 30;
  if (months > 20) {
    return TimelineGroupTimespan.Year;
  } else if (days > 40) {
    return TimelineGroupTimespan.Month;
  } else if (hours > 50) {
    return TimelineGroupTimespan.Day;
  } else {
    return TimelineGroupTimespan.Hour;
  }
}

export function GroupByTimespan(items: ItemVO[], timespan: TimelineGroupTimespan, bestFit = false) {
  const timelineItems: (TimelineGroup | TimelineItem)[] = [];
  const records: RecordVO[] = [];

  if (bestFit) {
    const bestFitTimespan = getBestFitTimespanForItems(items);
    console.log('given timespan', timespan);
    console.log('best fit timespan', bestFitTimespan);
    timespan = bestFitTimespan;
  }

  for (const item of items) {
    if (item instanceof FolderVO) {
      timelineItems.push(new TimelineItem(item));
    } else {
      records.push(item);
    }
  }

  const groups = groupBy(records, record => {
    return moment(record.displayDT).format(getDateFormatFromTimespan(timespan));
  });

  for (const key in groups) {
    if (groups.hasOwnProperty(key)) {
      const groupItems = groups[key];
      if (groupItems.length === 1) {
        timelineItems.push(new TimelineItem(groupItems[0]));
      } else {
        const timelineGroup = new TimelineGroup(groupItems, timespan, key);
        timelineItems.push(timelineGroup);
      }

    }
  }

  return {
    groupedItems: timelineItems,
    timespan: timespan
  };
}
