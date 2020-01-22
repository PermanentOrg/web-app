import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Timeline, DataSet, TimelineOptions, TimelineEventPropertiesResult, DataItem } from 'vis-timeline';
import { ActivatedRoute } from '@angular/router';
import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { isNumber } from 'util';
import { GroupByTimespan, TimelineGroup, TimelineItem, TimelineDataItem, TimelineGroupTimespan } from './timeline-util';

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
    minHeight: '300px',
  };
  private currentTimespan: TimelineGroupTimespan;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private api: ApiService
  ) {
    this.currentTimespan = TimelineGroupTimespan.Year;
  }

  ngOnInit() {
    this.data.setCurrentFolder(this.route.snapshot.data.folder);
    this.groupTimelineItems(true);
  }

  ngAfterViewInit() {
    this.initTimeline();
  }

  ngOnDestroy() {
    this.timeline.destroy();
  }

  initTimeline() {
    const container = this.timelineElemRef.nativeElement;
    this.timeline = new Timeline(container, this.timelineItems, this.timelineOptions);
    console.log(new Date().getTime(), 'timelineview init!');
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

    console.log(new Date().getTime(), 'timeline items grouped!');
  }

  onTimelineMove() {
    console.log(new Date().getTime(), 'timelineview changed');
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
    const folderResponse = await this.api.folder.navigate(folder).toPromise();
    this.data.setCurrentFolder(folderResponse.getFolderVO());
    this.groupTimelineItems();
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
    this.timeline.setWindow(group.start, group.end);
  }

}
