import { Component, OnInit, OnDestroy, ElementRef, Inject, AfterViewInit, Renderer, Renderer2} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import * as Hammer from 'hammerjs';
import { TweenMax } from 'gsap';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { filter as lodashFilter, findIndex } from 'lodash';

import { RecordVO, FolderVO} from '@root/app/models';
import { DataService } from '@shared/services/data/data.service';
import { DataStatus } from '@models/data-status.enum';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  public currentRecord: RecordVO;
  public prevRecord: RecordVO;
  public nextRecord: RecordVO;
  public records: RecordVO[];
  public currentIndex: number;

  private touchElement: HTMLElement;
  private thumbElement: HTMLElement;
  private bodyScroll: number;
  private hammer: HammerManager;
  private disableSwipes: boolean;

  private velocityThreshold = 0.2;
  private screenWidth: number;
  private offscreenThreshold: number;

  public showThumbnail = true;
  public isVideo = false;

  private routeListener: Subscription;
  private reinit = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private element: ElementRef,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2
  ) {

    this.currentRecord = route.snapshot.data.currentRecord;
    this.records = lodashFilter(this.dataService.currentFolder.ChildItemVOs, 'isRecord') as RecordVO[];
    this.currentIndex = findIndex(this.records, {folder_linkId: this.currentRecord.folder_linkId});
    this.loadQueuedItems();
  }

  ngOnInit() {
    this.initRecord();

    // disable scrolling file list in background
    this.document.body.style.setProperty('overflow', 'hidden');

    // bind hammer events to thumbnail area
    this.touchElement = this.element.nativeElement.querySelector('.thumb-target');
    this.hammer = new Hammer(this.touchElement);
    this.hammer.on('pan', (evt: HammerInput) => {
      this.handlePanEvent(evt);
    });

    this.screenWidth = this.touchElement.clientWidth;
    this.offscreenThreshold = this.screenWidth / 2;

    this.reinit = true;
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.document.body.style.setProperty('overflow', '');
  }

  initRecord() {
    this.currentRecord = this.route.snapshot.data.currentRecord;
    this.isVideo = this.currentRecord.type.includes('video');
  }

  isQueued(indexToCheck: number) {
    return indexToCheck >= this.currentIndex - 1 && indexToCheck <= this.currentIndex + 1;
  }

  handlePanEvent(evt: HammerInput) {
    if (this.disableSwipes) {
      return;
    }

    const queuedThumbs = document.querySelectorAll('.thumb-wrapper.queue');

    const previous = evt.deltaX > 0;
    const next = evt.deltaX < 0;
    const canNavigate = (previous && this.records[this.currentIndex - 1]) || (next && this.records[this.currentIndex + 1]);
    const fastEnough = Math.abs(evt.velocityX) > this.velocityThreshold;
    const farEnough = Math.abs(evt.deltaX) > this.offscreenThreshold;

    if (!evt.isFinal) {
      // follow pointer for panning
      TweenMax.set(
        queuedThumbs,
        {
          x: (index, target) => {
            return evt.deltaX + (getOrder(target) * this.screenWidth);
          }
        }
      );
    } else if (!(fastEnough || farEnough) || !canNavigate) {
      // reset to center, not fast enough or far enough
      TweenMax.to(
        queuedThumbs,
        0.5,
        {
          x: (index, target) => {
            return getOrder(target) * this.screenWidth;
          },
          ease: 'Power4.easeOut',
        } as any
      );
    } else {
      // send offscreen to left or right, depending on direction
      let offset = 1;
      if (evt.deltaX < 0) {
        offset = -1;
      }
      this.disableSwipes = true;
      TweenMax.to(
        queuedThumbs,
        0.5,
        {
          x: (index, target) => {
            return (getOrder(target) + offset) * this.screenWidth;
          },
          ease: 'Power4.easeOut',
          onComplete: () => {
            let targetIndex = this.currentIndex;
            if (previous) {
              targetIndex--;
            } else {
              targetIndex++;
            }

            // update current record and fetch surrounding items
            const targetRecord = this.records[targetIndex];

            this.currentIndex = targetIndex;
            this.currentRecord = targetRecord;

            this.disableSwipes = false;
            this.loadQueuedItems();
            this.router.navigate(['../', targetRecord.archiveNbr], {relativeTo: this.route});
          }
        } as any
      );
    }



    function getOrder(elem: HTMLElement) {
      if (elem.classList.contains('prev')) {
        return -1;
      } if (elem.classList.contains('next')) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  loadQueuedItems() {
    const surroundingCount = 4;
    const start = Math.max(this.currentIndex - surroundingCount, 0);
    const end = Math.min(this.currentIndex + surroundingCount + 1, this.records.length);
    const itemsToFetch = this.records.slice(start, end).filter((item: RecordVO) => item.dataStatus < DataStatus.Lean );
    if (itemsToFetch.length) {
      this.dataService.fetchLeanItems(itemsToFetch);
    }
  }

  close() {
    const routeParams = this.route.snapshot.params;
    if (routeParams.archiveNbr) {
      this.router.navigate(['/myfiles', routeParams.archiveNbr, routeParams.folderLinkId]);
    } else {
      this.router.navigate(['/myfiles']);
    }
    return false;
  }

}
