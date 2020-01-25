import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Timeline, DataSet, TimelineOptions, TimelineEventPropertiesResult, DataItem } from '@permanent.org/vis-timeline';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { remove, find, throttle, minBy, maxBy } from 'lodash';
import {  TimelineGroup, TimelineItem, TimelineDataItem, TimelineGroupTimespan, Minute, Year,
  GroupByTimespan, GetTimespanFromRange, getBestFitTimespanForItems
} from './timeline-util';
import { TimelineRecordTemplate, TimelineFolderTemplate, TimelineGroupTemplate } from './timeline-templates';
import { PrConstantsPipe } from '@shared/pipes/pr-constants.pipe';
import { Subscription } from 'rxjs';
import { TimelineBreadcrumbsComponent, TimelineBreadcrumb } from './timeline-breadcrumbs/timeline-breadcrumbs.component';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';

interface VoDataItem extends DataItem {
  itemVO: FolderVO | RecordVO;
}

type ItemVO = RecordVO | FolderVO;

const ZOOM_PERCENTAGE = 1;

@Component({
  selector: 'pr-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss']
})
export class TimelineViewComponent implements OnInit, AfterViewInit, OnDestroy {
  public isNavigating = false;

  private throttledZoomHandler = throttle((evt) => {
    this.onTimelineZoom(evt);
  }, 256);
  private dataServiceSubscription: Subscription;

  public hasPrev = true;
  public hasNext = true;

  @ViewChild(TimelineBreadcrumbsComponent, { static: true }) breadcrumbs: TimelineBreadcrumbsComponent;
  @ViewChild('timelineContainer', { static: true }) timelineElemRef: ElementRef;
  public timeline: Timeline;
  private currentTimespan: TimelineGroupTimespan;
  public timelineGroups = new Map<TimelineGroupTimespan, DataItem[]>();
  private timelineItems: DataSet<DataItem> = new DataSet();
  private timelineOptions: TimelineOptions = {
    zoomMin: Minute * 1,
    zoomMax: Year * 50,
    showCurrentTime: false,
    height: '100%',
    selectable: false,
    zoomable: false,
    orientation: {
      axis: 'bottom',
      item: 'center'
    },
    format: {
      minorLabels: {
        minute: 'h:mm A',
        hour: 'h A',
        weekday: 'Do',
        day: 'Do',
        week: 'Do'
      },
      majorLabels: {
        minute: 'MMMM Do, h:mm A',
        hour: 'MMMM Do, h A',
        weekday: 'MMMM Do, YYYY',
        day: 'MMMM Do, YYYY',
        week: 'MMMM YYYY',
      }
    },
    template: (item: any, element: HTMLDivElement, data) => {
      switch ((item as TimelineDataItem).dataType) {
        case 'record':
          return TimelineRecordTemplate(item);
        case 'folder':
          return TimelineFolderTemplate(item);
        case 'group':
          return TimelineGroupTemplate(item);
      }
    }
  };
  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private api: ApiService,
    private router: Router,
    private elementRef: ElementRef,
    private fvService: FolderViewService
  ) {
    this.currentTimespan = TimelineGroupTimespan.Year;
    this.data.showBreadcrumbs = false;
    this.data.showPublicArchiveDescription = false;
    this.fvService.containerFlexChange.emit(true);
  }

  ngOnInit() {
    this.data.setCurrentFolder(this.route.snapshot.data.currentFolder);
    this.onFolderChange();
    this.dataServiceSubscription = this.data.currentFolderChange.subscribe(() => {
      this.onFolderChange();
      this.setMaxZoom();
    });
  }

  ngAfterViewInit() {
    this.initTimeline();
    this.setMaxZoom();

    const elem = this.elementRef.nativeElement as HTMLDivElement;
    console.log(elem.offsetHeight);
  }

  ngOnDestroy() {
    this.timeline.destroy();
    this.dataServiceSubscription.unsubscribe();
    this.data.showBreadcrumbs = true;
    this.data.showPublicArchiveDescription = true;
    this.fvService.containerFlexChange.emit(false);
  }

  onFolderChange() {
    this.timelineGroups.clear();
    this.groupTimelineItems(true);
  }

  initTimeline() {
    const container = this.timelineElemRef.nativeElement;
    this.timeline = new Timeline(container, this.timelineItems, this.timelineOptions);
    this.timeline.on('click', evt => {
      this.onTimelineItemClick(evt);
    });

    this.timeline.on('rangechange', evt => {
      this.throttledZoomHandler(evt);
    });

    this.timeline.on('rangechanged', evt => {
      this.throttledZoomHandler(evt);
      this.breadcrumbs.debouncedZoomHandler(evt);
    });
  }

  setMaxZoom() {
    const range = this.timeline.getItemRange();
    const start = range.min.valueOf();
    const end = range.max.valueOf();
    const diff = end - start;

    this.timeline.setOptions({zoomMax: 1.05 * diff});
  }

  groupTimelineItems(bestFitTimespan = false) {
    if (this.timelineItems.length) {
      this.timelineItems.remove(this.timelineItems.getIds());
    }

    let timespan = this.currentTimespan;
    if (bestFitTimespan) {
      timespan = getBestFitTimespanForItems(this.data.currentFolder.ChildItemVOs);
    }

    if (this.timelineGroups.has(timespan)) {
      this.timelineItems.add(this.timelineGroups.get(timespan));
    } else {
      const groupResult = GroupByTimespan(this.data.currentFolder.ChildItemVOs, this.currentTimespan, bestFitTimespan);
      this.currentTimespan = groupResult.timespan;
      this.timelineItems.add(groupResult.groupedItems);
      this.timelineGroups.set(groupResult.timespan, groupResult.groupedItems);
    }
  }

  focusItemsWithBuffer(ids: string[]) {
    if (ids.length === 1) {
      return this.timeline.focus(ids);
    }

    let start = null;
    let end = null;
    for (const id of ids) {
      const item = this.timelineItems.get(id);
      const s = item.start;
      const e = 'end' in item ? item.end : item.start;

      if (start === null || s < start) {
        start = s;
      }

      if (end === null || e > end) {
        end = e;
      }
    }

    const bufferSize = 0.1;
    const range = end - start;
    start -= bufferSize * range;
    end += bufferSize * range;

    this.timeline.setWindow(start, end);
  }

  onZoomInClick() {
    this.timeline.zoomIn(ZOOM_PERCENTAGE);
  }

  onZoomOutClick() {
    this.timeline.zoomOut(ZOOM_PERCENTAGE);
  }

  onPrevClick() {
    const range = this.timeline.getWindow();
    const start = range.start.valueOf();
    const end = range.end.valueOf();
    const minDiff = (end - start) * 0.5;
    const midpoint = (end + start) / 2;
    const midpointWithMinDiff = midpoint - minDiff;

    let firstItemBefore: DataItem;
    this.timelineItems.forEach(i => {
      if (i.start < midpointWithMinDiff) {
        if (!firstItemBefore) {
          firstItemBefore = i;
        } else if (firstItemBefore.start < i.start) {
          firstItemBefore = i;
        }
      }
    });

    if (firstItemBefore) {
      const newMidpoint = firstItemBefore.start as number - 10;
      const newStart = newMidpoint - (midpoint - start);
      const newEnd = newMidpoint + (end - midpoint);

      this.timeline.setWindow(newStart, newEnd);
    } else {
      this.hasPrev = false;
    }
  }

  onNextClick() {
    const range = this.timeline.getWindow();
    const start = range.start.valueOf();
    const end = range.end.valueOf();
    const minDiff = (end - start) * 0.5;
    const midpoint = (end + start) / 2;
    const midpointWithMinDiff = midpoint + minDiff;

    let firstItemAfter: DataItem;
    this.timelineItems.forEach(i => {
      if (i.start > midpointWithMinDiff) {
        if (!firstItemAfter) {
          firstItemAfter = i;
        } else if (firstItemAfter.start > i.start) {
          firstItemAfter = i;
        }
      }
    });

    if (firstItemAfter) {
      const newMidpoint = firstItemAfter.start as number + 10;
      const newStart = newMidpoint - (midpoint - start);
      const newEnd = newMidpoint + (end - midpoint);

      this.timeline.setWindow(newStart, newEnd);
    } else {
      this.hasPrev = false;
    }

  }

  onTimelineZoom(event) {
    this.breadcrumbs.debouncedZoomHandler(event);

    const start = event.start.getTime();
    const end = event.end.getTime();
    const newTimespan = GetTimespanFromRange(start, end);

    // only adjust grouping if user zoomed OUT
    if (newTimespan !== undefined && newTimespan !== this.currentTimespan) {
      this.currentTimespan = newTimespan;
      this.groupTimelineItems(false);
    }

    this.hasNext = true;
    this.hasPrev = true;
  }

  onTimelineItemClick(event: TimelineEventPropertiesResult & {isCluster: boolean}) {
    if (!event.isCluster && !this.isNavigating) {
      const timelineItem: any = this.timelineItems.get(event.item);
      switch ((timelineItem as TimelineDataItem).dataType) {
        case 'folder':
          this.onFolderClick((timelineItem as TimelineItem).item as FolderVO);
          break;
        case 'group':
          this.onGroupClick(timelineItem as TimelineGroup);
          break;
        case 'record':
          this.onRecordClick((timelineItem as TimelineItem).item as RecordVO);
          break;
      }
    }
  }

  async onFolderClick(folder: FolderVO) {
    this.isNavigating = true;
    if (folder.isFetching) {
      await folder.fetched;
    }
    const folderResponse = await this.api.folder.navigateLean(folder).toPromise();
    this.data.setCurrentFolder(folderResponse.getFolderVO(true));
    this.groupTimelineItems(true);
    this.timeline.fit();
    this.isNavigating = false;
  }

  async onRecordClick(record: RecordVO) {
    this.isNavigating = true;
    await this.router.navigate(['record', record.archiveNbr], {relativeTo: this.route});
    this.isNavigating = false;
  }

  findItemsInRange(start: number, end: number) {
    const itemIds = [];
    this.timelineItems.forEach(item => {
      if (item.start >= start && (item.start <= end) && (!item.end || item.end <= end)) {
        itemIds.push(item.id);
      }
    });

    return itemIds;
  }

  focusItemsInRange(start: number, end: number) {
    this.focusItemsWithBuffer(this.findItemsInRange(start, end));
  }

  onGroupClick(group: TimelineGroup) {
    const newTimespan: TimelineGroupTimespan = group.groupTimespan + 1;

    this.currentTimespan = newTimespan;

    this.groupTimelineItems(false);
    this.focusItemsInRange(group.groupStart, group.groupEnd);
    this.breadcrumbs.onGroupClick(group);
  }

  onBreadcrumbClick(breadcrumb: TimelineBreadcrumb) {
    if (breadcrumb.type === 'folder') {
      if (breadcrumb.folder_linkId === this.data.currentFolder.folder_linkId) {
        this.groupTimelineItems(true);
        this.timeline.fit();
        this.breadcrumbs.setTimeBreadcrumbs();
      } else {
        this.onFolderClick(new FolderVO({
          archiveNbr: breadcrumb.archiveNbr,
          folder_linkId: breadcrumb.folder_linkId
        }));
      }
    } else {
      const groups = this.timelineGroups.get(breadcrumb.timespan);
      const group = find(groups, (g: TimelineGroup | TimelineItem) => {
        return g.dataType === 'group' && g.content === breadcrumb.text ;
      });
      console.log(breadcrumb, group);
      this.onGroupClick(group as TimelineGroup);
      // this.breadcrumbs.onGroupClick(group);
      // this.currentTimespan = breadcrumb.timespan + 1;
      // this.groupTimelineItems(false);
      // this.focusItemsInRange(breadcrumb.timespanStart, breadcrumb.timespanEnd);
    }
  }

}
