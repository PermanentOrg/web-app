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

interface VoDataItem extends DataItem {
  itemVO: FolderVO | RecordVO;
}

type ItemVO = RecordVO | FolderVO;

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

  @ViewChild(TimelineBreadcrumbsComponent, { static: true }) breadcrumbs: TimelineBreadcrumbsComponent;
  @ViewChild('timelineContainer', { static: true }) timelineElemRef: ElementRef;
  public timeline: Timeline;
  private timelineRootFolder: FolderVO;
  private currentTimespan: TimelineGroupTimespan;
  public timelineGroups = new Map<TimelineGroupTimespan, DataItem[]>();
  private timelineItems: DataSet<DataItem> = new DataSet();
  private timelineOptions: TimelineOptions = {
    zoomMin: Minute * 1,
    zoomMax: Year * 50,
    showCurrentTime: false,
    height: '100%',
    selectable: false,
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
  ) {
    this.currentTimespan = TimelineGroupTimespan.Year;
    this.timelineRootFolder = this.route.snapshot.data.folder;
  }

  ngOnInit() {
    this.data.setCurrentFolder(this.route.snapshot.data.folder);
    this.onFolderChange();
    this.dataServiceSubscription = this.data.currentFolderChange.subscribe(() => {
      this.onFolderChange();
      this.setMaxZoom();
    });
  }

  ngAfterViewInit() {
    this.initTimeline();
    this.setMaxZoom();
  }

  ngOnDestroy() {
    this.timeline.destroy();
    this.dataServiceSubscription.unsubscribe();
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

  onTimelineZoom(event) {
    if (!event.byUser) {
      return;
    }

    this.breadcrumbs.debouncedZoomHandler(event);

    const start = event.start.getTime();
    const end = event.end.getTime();
    const newTimespan = GetTimespanFromRange(start, end);

    // only adjust grouping if user zoomed OUT
    if (newTimespan !== undefined && newTimespan !== this.currentTimespan && newTimespan < this.currentTimespan) {
      this.currentTimespan = newTimespan;
      this.groupTimelineItems(false);
    }
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
    this.timeline.focus(this.findItemsInRange(start, end));
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
