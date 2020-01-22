import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Timeline, DataSet, TimelineOptions, TimelineEventPropertiesResult, DataItem } from 'vis-timeline';
import { ActivatedRoute } from '@angular/router';
import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { remove } from 'lodash';
import { GroupByTimespan, TimelineGroup, TimelineItem, TimelineDataItem, TimelineGroupTimespan, Minute, Day, Hour } from './timeline-util';
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
    height: '100%',
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

  private animationDuration: 1000;
  private currentTimespan: TimelineGroupTimespan;
  public breadcrumbs: TimelineBreadcrumb[] = [];

  private timelineRootFolder: FolderVO;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private api: ApiService
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

    this.timeline.on('changed', evt => {
      this.onTimelineMove();
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

  onTimelineMove() {
    // const visibleSingleItems = this.timeline.getVisibleItems().filter(id => typeof id === 'number');
    // const items = this.data.getItemsByFolderLinkIds(visibleSingleItems);
    // this.data.fetchLeanItems(items);
  }

  onTimelineItemClick(event: TimelineEventPropertiesResult & {isCluster: boolean}) {
    if (!event.isCluster) {
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
    if (folder.isFetching) {
      await folder.fetched;
    }
    const folderResponse = await this.api.folder.navigateLean(folder).toPromise();
    this.data.setCurrentFolder(folderResponse.getFolderVO(true));
    this.groupTimelineItems(true);
    this.timeline.fit();
  }

  onRecordClick(record: RecordVO) {
    console.log('record click', record);
  }

  onGroupClick(group: TimelineGroup) {
    const newTimespan: TimelineGroupTimespan = group.groupTimespan + 1;

    if (newTimespan <= TimelineGroupTimespan.Day) {
      this.currentTimespan = newTimespan;
    }

    this.groupTimelineItems(false);

    const itemIdsToFocus = [];
    this.timelineItems.forEach(item => {
      if (item.start >= group.groupStart && (item.start <= group.groupEnd) && (!item.end || item.end <= group.groupEnd)) {
        itemIdsToFocus.push(item.id);
      }
    });
    this.timeline.focus(itemIdsToFocus);

    this.breadcrumbs.push({
      text: group.groupName,
      type: 'timespan',
      timespan: group.groupTimespan,
      timespanName: group.groupName
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
      this.currentTimespan = breadcrumb.timespan;
      remove(this.breadcrumbs, x => x.timespan > breadcrumb.timespan);
      this.groupTimelineItems();
      this.timeline.fit();
    }
  }

}
