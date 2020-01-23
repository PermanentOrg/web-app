import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Timeline, DataSet, TimelineOptions, TimelineEventPropertiesResult, DataItem } from 'vis-timeline';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { remove, find } from 'lodash';
import { GroupByTimespan, TimelineGroup, TimelineItem, TimelineDataItem, TimelineGroupTimespan, Minute, Day, Hour, Year, Month } from './timeline-util';
import { TimelineRecordTemplate, TimelineFolderTemplate, TimelineGroupTemplate } from './timeline-templates';

interface VoDataItem extends DataItem {
  itemVO: FolderVO | RecordVO;
}

type ItemVO = RecordVO | FolderVO;

function getDataItemFromVo(item: ItemVO): DataItem {
  if (item instanceof FolderVO) {
    return {
      id: item.folder_linkId,
      start: item.displayDT,
      end: item.displayEndDT,
      content: item.displayName
    };
  } else {
    return {
      id: item.folder_linkId,
      start: item.displayDT,
      content: item.displayName
    };
  }
}

interface TimelineBreadcrumb {
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
  selector: 'pr-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss']
})
export class TimelineViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('timeline', { static: true }) timelineElemRef: ElementRef;

  private timeline: Timeline;

  private timelineItems: DataSet<DataItem> = new DataSet();
  private timelineOptions: TimelineOptions = {
    zoomMin: Minute * 1,
    zoomMax: Year * 50,
    showCurrentTime: false,
    height: '100%',
    selectable: false,
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

  private currentTimespan: TimelineGroupTimespan;
  public breadcrumbs: TimelineBreadcrumb[] = [];
  public isNavigating = false;

  private timelineRootFolder: FolderVO;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private api: ApiService,
    private router: Router
  ) {
    this.currentTimespan = TimelineGroupTimespan.Year;

    this.timelineRootFolder = this.route.snapshot.data.folder;
  }

  ngOnInit() {
    this.data.setCurrentFolder(this.route.snapshot.data.folder);
    this.onFolderChange();
    this.data.currentFolderChange.subscribe(() => {
      this.onFolderChange();
    });
  }

  ngAfterViewInit() {
    this.initTimeline();
    this.onFolderChange();
  }

  onFolderChange() {
    this.setFolderBreadcrumbs();
    this.groupTimelineItems(true);
  }

  ngOnDestroy() {
    this.timeline.destroy();
  }

  setFolderBreadcrumbs() {
    // folder path
    this.breadcrumbs = [];

    const folder = this.data.currentFolder;
    for (let i = 0; i < folder.pathAsFolder_linkId.length; i++) {
      this.breadcrumbs.push({
        type: 'folder',
        text: folder.pathAsText[i],
        archiveNbr: folder.pathAsArchiveNbr[i],
        folder_linkId: folder.pathAsFolder_linkId[i]
      });
    }
  }

  initTimeline() {
    const container = this.timelineElemRef.nativeElement;
    this.timeline = new Timeline(container, this.timelineItems, this.timelineOptions);
    this.timeline.on('click', evt => {
      this.onTimelineItemClick(evt);
    });

    this.timeline.on('rangechanged', evt => {
      if (evt.byUser) {
        this.onTimelineZoom(evt);
      }
    });
  }

  groupTimelineItems(bestFitTimespan = false) {
    if (this.timelineItems.length) {
      this.timelineItems.remove(this.timelineItems.getIds());
    }
    const groupResult = GroupByTimespan(this.data.currentFolder.ChildItemVOs, this.currentTimespan, bestFitTimespan);
    this.timelineItems.add(groupResult.groupedItems);
    this.currentTimespan = groupResult.timespan;
  }

  onTimelineZoom(event) {
    const diff = event.end.getTime() - event.start.getTime();
    let newTimespan = null;
    if (diff > 2 * Year) {
      newTimespan = TimelineGroupTimespan.Year;
    } else if (diff > 2 * Month) {
      newTimespan = TimelineGroupTimespan.Month;
    } else if (diff > 2 * Day) {
      newTimespan = TimelineGroupTimespan.Day;
    } else if (diff > 2 * Hour) {
      newTimespan = TimelineGroupTimespan.Hour;
    } else {
      newTimespan = TimelineGroupTimespan.Item;
    }


    // only adjust grouping if user zoomed OUT

    if (newTimespan !== null && newTimespan !== this.currentTimespan && newTimespan < this.currentTimespan) {
      this.currentTimespan = newTimespan;
      remove(this.breadcrumbs, x => x.timespan >= this.currentTimespan);
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

  focusItemsInRange(start: number, end: number) {
    const itemIdsToFocus = [];
    this.timelineItems.forEach(item => {
      if (item.start >= start && (item.start <= end) && (!item.end || item.end <= end)) {
        itemIdsToFocus.push(item.id);
      }
    });
    this.timeline.focus(itemIdsToFocus);
  }

  onGroupClick(group: TimelineGroup) {
    const newTimespan: TimelineGroupTimespan = group.groupTimespan + 1;

    this.currentTimespan = newTimespan;

    this.groupTimelineItems(false);
    this.focusItemsInRange(group.groupStart, group.groupEnd);

    this.breadcrumbs.push({
      text: group.groupName,
      type: 'timespan',
      timespan: group.groupTimespan,
      timespanName: group.groupName,
      timespanStart: group.groupStart,
      timespanEnd: group.groupEnd
    });
  }

  onBreadcrumbClick(breadcrumb: TimelineBreadcrumb) {
    if (breadcrumb.type === 'folder') {
      if (breadcrumb.folder_linkId === this.data.currentFolder.folder_linkId) {
        this.groupTimelineItems(true);
        this.setFolderBreadcrumbs();
        this.timeline.fit();
      } else {
        this.onFolderClick(new FolderVO({
          archiveNbr: breadcrumb.archiveNbr,
          folder_linkId: breadcrumb.folder_linkId
        }));
      }
    } else {
      this.currentTimespan = Math.min(breadcrumb.timespan + 1, 4);
      remove(this.breadcrumbs, x => {
        return x.timespan > breadcrumb.timespan || (x.timespan === breadcrumb.timespan && x.timespanName !== breadcrumb.timespanName);
      });
      this.groupTimelineItems(false);
      this.focusItemsInRange(breadcrumb.timespanStart, breadcrumb.timespanEnd);
    }
  }

}
