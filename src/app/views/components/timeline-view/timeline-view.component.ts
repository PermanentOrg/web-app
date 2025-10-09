import {
	Component,
	OnInit,
	AfterViewInit,
	ViewChild,
	ElementRef,
	OnDestroy,
	HostListener,
	Inject,
	Optional,
} from '@angular/core';

import {
	Timeline,
	// @ts-ignore: DataSet is exported from index.js but not defined in index.d.ts
	DataSet,
	TimelineOptions,
	TimelineEventPropertiesResult,
	DataItem,
} from 'vis-timeline/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderVO, RecordVO, ItemVO, TimezoneVOData } from '@models';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { find, throttle, maxBy, debounce, countBy } from 'lodash';
import { Subscription } from 'rxjs';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { DeviceService } from '@shared/services/device/device.service';
import { slideUpAnimation } from '@shared/animations';
import {
	TimelineBreadcrumbsComponent,
	TimelineBreadcrumb,
} from './timeline-breadcrumbs/timeline-breadcrumbs.component';
import {
	TimelineRecordTemplate,
	TimelineFolderTemplate,
	TimelineGroupTemplate,
} from './timeline-templates';
import {
	TimelineGroup,
	TimelineItem,
	TimelineDataItem,
	TimelineGroupTimespan,
	Minute,
	GroupByTimespan,
	GetTimespanFromRange,
	getBestFitTimespanForItems,
	dateTypeToNumber,
} from './timeline-util';

export interface TimelineDataItemExtended extends DataItem {
	uuid: string;
	dataType: 'record' | 'folder' | 'group';
	item: unknown;
}

const ZOOM_PERCENTAGE = 1;

const DEFAULT_MAJOR_MINUTE_LABEL = 'MMMM Do, h:mm A';
const DEFAULT_MAJOR_HOUR_LABEL = 'MMMM Do, h A';
@Component({
	selector: 'pr-timeline-view',
	templateUrl: './timeline-view.component.html',
	styleUrls: ['./timeline-view.component.scss'],
	animations: [slideUpAnimation],
	standalone: false,
})
export class TimelineViewComponent implements OnInit, AfterViewInit, OnDestroy {
	public isNavigating = false;

	private throttledZoomHandler = throttle((evt) => {
		this.onTimelineZoom();
	}, 256);
	private debouncedResizeHandler = debounce(() => {
		this.groupTimelineItems(true);
		setTimeout(() => {
			this.timeline.redraw();
		});
	}, 250);
	private dataServiceSubscription: Subscription;

	public hasPrev = true;
	public hasNext = true;

	public timelineRootFolder: FolderVO;
	public showFolderDetails = false;

	public displayTimezoneOffset: string;
	public currentTimezone: TimezoneVOData;
	public timezones: Map<number, TimezoneVOData> = new Map();

	@ViewChild(TimelineBreadcrumbsComponent, { static: true })
	breadcrumbs: TimelineBreadcrumbsComponent;
	@ViewChild('timelineContainer', { static: true }) timelineElemRef: ElementRef;
	public timeline: Timeline;
	private currentTimespan: TimelineGroupTimespan;
	public timelineGroups = new Map<TimelineGroupTimespan, DataItem[]>();
	private timelineItems: DataSet<TimelineDataItemExtended> =
		new DataSet<TimelineDataItemExtended>();

	private timelineOptions: TimelineOptions = {
		zoomMin: Minute * 1,
		showCurrentTime: false,
		height: '100%',
		selectable: false,
		zoomable: false,
		orientation: {
			axis: 'bottom',
			item: 'center',
		},
		format: {
			minorLabels: {
				minute: 'h:mm A',
				hour: 'h A',
				weekday: 'Do',
				day: 'Do',
				week: 'Do',
			},
			majorLabels: {
				second: DEFAULT_MAJOR_MINUTE_LABEL,
				minute: DEFAULT_MAJOR_MINUTE_LABEL,
				hour: 'MMMM Do, h A',
				weekday: 'MMMM Do, YYYY',
				day: 'MMMM Do, YYYY',
				week: 'MMMM YYYY',
			},
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
		},
	};

	constructor(
		@Optional() @Inject(DIALOG_DATA) public dialogData: any,
		@Optional() private dialog: DialogRef,
		private route: ActivatedRoute,
		private dataService: DataService,
		private api: ApiService,
		private router: Router,
		private elementRef: ElementRef,
		private fvService: FolderViewService,
		private device: DeviceService,
	) {
		this.currentTimespan = TimelineGroupTimespan.Year;
		this.dataService.showBreadcrumbs = false;
		this.dataService.showPublicArchiveDescription = false;
		this.dataService.publicCta = 'timeline';
		this.fvService.containerFlexChange.emit(true);

		this.timelineRootFolder = this.route.snapshot.data.currentFolder;
		this.dataService.setCurrentFolder(this.route.snapshot.data.currentFolder);
		if (dialogData?.activatedRoute) {
			this.route = dialogData.activatedRoute;
		}
	}

	ngOnInit() {
		this.onFolderChange();
		this.dataServiceSubscription =
			this.dataService.currentFolderChange.subscribe(() => {
				this.onFolderChange();
			});
	}

	ngAfterViewInit() {
		this.initTimeline();
		this.setMaxZoom();
		this.addPixelMargin();
		this.timeline.fit();
	}

	ngOnDestroy() {
		this.timeline.destroy();
		this.dataServiceSubscription.unsubscribe();
		this.dataService.showBreadcrumbs = true;
		this.dataService.showPublicArchiveDescription = true;
		this.dataService.publicCta = null;
		this.fvService.containerFlexChange.emit(false);
	}

	@HostListener('window:resize', ['$event'])
	onViewportResize() {
		this.debouncedResizeHandler();
	}

	toggleFolderDetails() {
		if (this.timelineRootFolder.description) {
			this.showFolderDetails = !this.showFolderDetails;
		} else {
			this.showFolderDetails = false;
		}
	}

	onFolderChange() {
		this.timelineGroups.clear();
		this.findBestTimezone();
		this.timelineRootFolder = this.dataService.currentFolder;
		this.groupTimelineItems(true, false);
		if (this.timeline) {
			this.setMaxZoom();
			this.addPixelMargin();
			this.timeline.fit();
		}
	}

	initTimeline() {
		const container = this.timelineElemRef.nativeElement;
		this.timeline = new Timeline(
			container,
			this.timelineItems,
			this.timelineOptions,
		);
		this.timeline.on('click', (evt) => {
			this.onTimelineItemClick(evt);
		});

		this.timeline.on('rangechanged', (evt) => {
			this.breadcrumbs.debouncedZoomHandler(evt);
		});
	}

	findBestTimezone() {
		const counts = countBy(
			this.dataService.currentFolder.ChildItemVOs.filter((i) => i.TimezoneVO),
			(i: ItemVO) => {
				const id = i.TimezoneVO.timeZoneId;
				if (!this.timezones.has(id)) {
					this.timezones.set(id, i.TimezoneVO);
				}
				return id;
			},
		);

		const ids = Object.keys(counts);

		if (ids.length) {
			const mostCommonId = Number(maxBy(ids, (o) => counts[o]));
			this.currentTimezone = this.timezones.get(mostCommonId);
		} else {
			this.currentTimezone = null;
		}

		const setMajorTimeLabel = (timezone: TimezoneVOData) => {
			let hourLabel = DEFAULT_MAJOR_HOUR_LABEL;
			let minuteLabel = DEFAULT_MAJOR_MINUTE_LABEL;
			if (timezone) {
				const split = timezone.stdAbbrev.split('');
				split.unshift('');
				const abbrev = split.join('\\');
				minuteLabel = `${minuteLabel} ${abbrev}`;
				hourLabel = `${hourLabel} ${abbrev}`;
			}
			if (this.timeline) {
				const options: TimelineOptions = {
					format: {
						majorLabels: {
							minute: minuteLabel,
							second: minuteLabel,
							hour: hourLabel,
						},
					},
				};

				this.timeline.setOptions(options);
			} else {
				(this.timelineOptions.format.majorLabels as any).minute = minuteLabel;
				(this.timelineOptions.format.majorLabels as any).second = minuteLabel;
				(this.timelineOptions.format.majorLabels as any).hour = hourLabel;
			}
		};

		setMajorTimeLabel(this.currentTimezone);
	}

	setMaxZoom() {
		const range = this.timeline.getItemRange();
		if (!range || !range.min || !range.max) {
			return;
		}

		const start = range.min.valueOf();
		const end = range.max.valueOf();
		const diff = end - start;
		const buffer = diff * 0.5;

		this.timeline.setOptions({
			min: start - buffer,
			max: end + buffer,
		});
	}

	groupTimelineItems(bestFitTimespan = false, keepFolders = true) {
		if (this.timelineItems.length) {
			let ids = this.timelineItems.getIds();
			if (keepFolders) {
				ids = ids.filter((id) => {
					const item: any = this.timelineItems.get(id);
					return (item as TimelineDataItem).dataType !== 'folder';
				});
			}
			this.timelineItems.remove(ids);
		}

		let timespan = this.currentTimespan;
		if (bestFitTimespan) {
			timespan = getBestFitTimespanForItems(
				this.dataService.currentFolder.ChildItemVOs,
			);
		}

		let itemsToAdd: any[];

		if (this.timelineGroups.has(timespan)) {
			itemsToAdd = this.timelineGroups.get(timespan);
		} else {
			const groupResult = GroupByTimespan(
				this.dataService.currentFolder.ChildItemVOs,
				this.currentTimespan,
				bestFitTimespan,
				this.currentTimezone,
			);
			this.currentTimespan = groupResult.timespan;
			this.timelineGroups.set(groupResult.timespan, groupResult.groupedItems);
			itemsToAdd = groupResult.groupedItems;
		}

		if (keepFolders) {
			itemsToAdd = itemsToAdd.filter(
				(x: TimelineDataItem) => x.dataType !== 'folder',
			);
		}

		this.timelineItems.add(itemsToAdd);
	}

	focusItemsWithBuffer(ids: (string | number)[], animate = true) {
		if (ids.length === 1) {
			const item = this.timelineItems.get(ids[0]) as DataItem &
				TimelineDataItem;
			if (item.dataType === 'group') {
				this.onGroupClick(item as TimelineGroup);
			} else {
				return this.timeline.focus(ids);
			}
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

		if (animate) {
			this.timeline.setWindow(start, end);
		} else {
			this.timeline.setWindow(start, end, { animation: false });
		}
	}

	onZoomInClick() {
		this.timeline.zoomIn(ZOOM_PERCENTAGE, null, () => {
			this.onTimelineZoom();
		});
	}

	onZoomOutClick() {
		this.timeline.zoomOut(ZOOM_PERCENTAGE, null, () => {
			this.onTimelineZoom();
		});
	}

	onPrevClick() {
		const range = this.timeline.getWindow();
		const start = range.start.valueOf();
		const end = range.end.valueOf();
		const minDiff = (end - start) * 0.5;
		const midpoint = (end + start) / 2;
		const midpointWithMinDiff = midpoint - minDiff;

		let firstItemBefore: DataItem;
		this.timelineItems.forEach((i) => {
			if (dateTypeToNumber(i.start) < midpointWithMinDiff) {
				if (!firstItemBefore) {
					firstItemBefore = i;
				} else if ((firstItemBefore.start as number) < (i.start as number)) {
					firstItemBefore = i;
				}
			}
		});

		if (firstItemBefore) {
			const newMidpoint = dateTypeToNumber(firstItemBefore.start) - 10;
			this.timeline.moveTo(newMidpoint);
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
		this.timelineItems.forEach((i) => {
			if (dateTypeToNumber(i.start) > midpointWithMinDiff) {
				if (!firstItemAfter) {
					firstItemAfter = i;
				} else if ((firstItemAfter.start as number) > Number(i.start)) {
					firstItemAfter = i;
				}
			}
		});

		if (firstItemAfter) {
			const newMidpoint = dateTypeToNumber(firstItemAfter.start) + 10;
			this.timeline.moveTo(newMidpoint);
		} else {
			this.hasPrev = false;
		}
	}

	onTimelineZoom() {
		const range = this.timeline.getWindow();
		const start = range.start.valueOf();
		const end = range.end.valueOf();
		const newTimespan = GetTimespanFromRange(start, end);

		if (newTimespan !== undefined && newTimespan !== this.currentTimespan) {
			this.currentTimespan = newTimespan;
			this.groupTimelineItems(false);
		}

		this.hasNext = true;
		this.hasPrev = true;
	}

	onTimelineItemClick(
		event: TimelineEventPropertiesResult & { isCluster: boolean },
	) {
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
		const folderResponse = await this.api.folder
			.navigateLean(folder)
			.toPromise();
		this.dataService.setCurrentFolder(folderResponse.getFolderVO(true));
		this.isNavigating = false;
	}

	async onRecordClick(record: RecordVO) {
		this.isNavigating = true;
		await this.router.navigate([
			this.router.routerState.snapshot.url.split('/record')[0],
			'record',
			record.archiveNbr,
		]);
		this.isNavigating = false;
	}

	findItemsInRange(start: number, end: number) {
		const itemIds = [];
		this.timelineItems.forEach((item) => {
			const itemStart = dateTypeToNumber(item.start);
			if (
				itemStart >= start &&
				itemStart <= end &&
				(!item.end || dateTypeToNumber(item.end) <= end)
			) {
				itemIds.push(item.id);
			}
		});

		return itemIds;
	}

	focusItemsInRange(start: number, end: number) {
		this.focusItemsWithBuffer(this.findItemsInRange(start, end));
	}

	findOnscreenItemIds() {
		const range = this.timeline.getWindow();
		const start = range.start.valueOf();
		const end = range.end.valueOf();
		return this.findItemsInRange(start, end);
	}

	onGroupClick(group: TimelineGroup) {
		const newTimespan: TimelineGroupTimespan = group.groupTimespan + 1;

		this.currentTimespan = newTimespan;

		this.groupTimelineItems(false);
		this.focusItemsInRange(group.groupStart, group.groupEnd);
		this.breadcrumbs.onGroupClick(group);
	}

	onBreadcrumbClick(breadcrumb: TimelineBreadcrumb) {
		this.showFolderDetails = false;
		if (breadcrumb.type === 'folder') {
			if (
				breadcrumb.folder_linkId ===
				this.dataService.currentFolder.folder_linkId
			) {
				this.groupTimelineItems(true, false);
				this.addPixelMargin();
				this.timeline.fit();
				this.breadcrumbs.setTimeBreadcrumbs();
			} else {
				this.onFolderClick(
					new FolderVO({
						archiveNbr: breadcrumb.archiveNbr,
						folder_linkId: breadcrumb.folder_linkId,
					}),
				);
			}
		} else {
			const groups = this.timelineGroups.get(breadcrumb.timespan);
			const group = find(
				groups,
				(g: TimelineGroup | TimelineItem) =>
					g.dataType === 'group' && g.content === breadcrumb.text,
			);
			this.onGroupClick(group as TimelineGroup);
		}
	}

	protected addPixelMargin(): void {
		// @ts-ignore: This is a hack to bypass maintaining a fork of vis-timeline
		for (const uuid in this.timeline.itemSet.items) {
			if (uuid.includes('-')) {
				// @ts-ignore
				const item = this.timeline.itemSet.items[uuid];
				item.width += (this.device.isMobileWidth() ? 10 : 100) * 2;
			}
		}
		this.debouncedResizeHandler();
	}
}
