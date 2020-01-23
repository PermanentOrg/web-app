import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { TimelineGroupTimespan, GetTimespanFromRange, GroupByTimespan, TimelineGroup, TimelineItem, TimelineItemDataType, TimelineDataItem } from '../timeline-util';
import { Subscription } from 'rxjs';
import { DataItem, Timeline } from 'vis-timeline';
import { debounce, minBy, remove } from 'lodash';

export interface TimelineBreadcrumb {
  text: string;
  type: 'folder' | 'timespan';

  archiveNbr?: string;
  folder_linkId?: number;

  timespan?: TimelineGroupTimespan;
  timespanName?: string;
  timespanStart?: number;
  timespanEnd?: number;
}

@Component({
  selector: 'pr-timeline-breadcrumbs',
  templateUrl: './timeline-breadcrumbs.component.html',
  styleUrls: ['./timeline-breadcrumbs.component.scss']
})
export class TimelineBreadcrumbsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() timelineGroups: Map<TimelineGroupTimespan, DataItem[]>;
  @Output() breadcrumbClicked = new EventEmitter<TimelineBreadcrumb>();

  public debouncedZoomHandler = debounce((evt) => {
    this.onTimelineZoom(evt);
  }, 250);

  public breadcrumbs: TimelineBreadcrumb[] = [];
  private dataServiceSubscription: Subscription;

  @ViewChild('scrollElem', { static: true }) scrollElem: ElementRef;

  constructor(
    private data: DataService
  ) {
    this.dataServiceSubscription = this.data.currentFolderChange.subscribe(folder => {
      this.setFolderBreadcrumbs();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setFolderBreadcrumbs();
  }

  ngOnDestroy() {
    this.dataServiceSubscription.unsubscribe();
  }

  onTimelineZoom(event) {
    const start = event.start.getTime();
    const end = event.end.getTime();
    const midpoint = (start + end ) / 2;
    let timespan = GetTimespanFromRange(start, end);
    let group: TimelineGroup;

    if (timespan > TimelineGroupTimespan.Year) {
      let bestMatch: TimelineItem | TimelineGroup;

      while ((!bestMatch || bestMatch.dataType !== 'group') && timespan > TimelineGroupTimespan.Year) {
        bestMatch = this.getBestMatchGroupForTimespan(midpoint, --timespan, true);
      }

      if (bestMatch.dataType === 'group') {
        group = bestMatch as TimelineGroup;
      }
    }

    this.setTimeBreadcrumbs(group);

  }

  onGroupClick(group: TimelineGroup) {
    this.setTimeBreadcrumbs(group);
  }

  setFolderBreadcrumbs() {
    this.breadcrumbs = [];

    if (!this.data.currentFolder) {
      return;
    }

    const folder = this.data.currentFolder;
    for (let i = 0; i < folder.pathAsFolder_linkId.length; i++) {
      this.breadcrumbs.push({
        type: 'folder',
        text: folder.pathAsText[i],
        archiveNbr: folder.pathAsArchiveNbr[i],
        folder_linkId: folder.pathAsFolder_linkId[i]
      });
    }

    this.scrollToEnd();
  }

  setTimeBreadcrumbs(group?: TimelineGroup) {
    remove(this.breadcrumbs, b => b.type === 'timespan');
    if (group) {
      const midpoint = group.groupEnd ? (group.groupStart + group.groupEnd) / 2 : group.groupStart;
      let timespan = TimelineGroupTimespan.Year;
      while (timespan < group.groupTimespan) {
        const bestMatch = this.getBestMatchGroupForTimespan(midpoint, timespan, true);
        if (bestMatch.dataType === 'group') {
          this.breadcrumbs.push(this.getBreadcrumbFromGroup(bestMatch));
        }
        timespan++;
      }
      this.breadcrumbs.push(this.getBreadcrumbFromGroup(group));
    }
  }

  scrollToEnd() {
    setTimeout(() => {
      const elem = (this.scrollElem.nativeElement as HTMLDivElement);
      elem.scrollLeft = elem.scrollWidth - elem.clientWidth;
    });
  }

  onBreadcrumbClick(clickedBreadcrumb: TimelineBreadcrumb) {
    this.breadcrumbClicked.emit(clickedBreadcrumb);
  }

  getBestMatchGroupForTimespan(time: number, timespan: TimelineGroupTimespan, allowItems = false) {
    timespan = Math.min(timespan, TimelineGroupTimespan.Hour);
    let items = this.timelineGroups.get(timespan);
    if (!items) {
      items = GroupByTimespan(this.data.currentFolder.ChildItemVOs, timespan).groupedItems;
      this.timelineGroups.set(timespan, items);
    }

    const diffs = items
      .filter((i: TimelineGroup | TimelineItem) => allowItems || i.dataType === 'group')
      .map((i: TimelineGroup) => {
        const diff = time - (i.end ? (i.start + i.end) / 2 : i.start);
        return {
          item: i,
          diff: Math.abs(diff)
        };
      });

    const bestMatch = minBy(diffs, d => d.diff).item;
    return bestMatch;
  }

  getBreadcrumbFromGroup(group: TimelineGroup) {
    const breadcrumb: TimelineBreadcrumb = {
      text: group.groupName,
      type: 'timespan',
      timespan: group.groupTimespan,
      timespanName: group.groupName,
      timespanStart: group.groupStart,
      timespanEnd: group.groupEnd
    };

    return breadcrumb;
  }

}
