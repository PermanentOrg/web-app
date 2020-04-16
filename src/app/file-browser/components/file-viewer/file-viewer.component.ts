import { Component, OnInit, OnDestroy, ElementRef, Inject, HostListener} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Key } from 'ts-key-enum';
import * as Hammer from 'hammerjs';
import { gsap } from 'gsap';
import { filter, findIndex, find } from 'lodash';

import { RecordVO, } from '@root/app/models';
import { DataService } from '@shared/services/data/data.service';
import { DataStatus } from '@models/data-status.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { DIALOG_DATA } from '@root/app/dialog/dialog.module';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnDestroy {

  // Record
  public currentRecord: RecordVO;
  public prevRecord: RecordVO;
  public nextRecord: RecordVO;
  public records: RecordVO[];
  public currentIndex: number;
  public isVideo = false;
  public isPdf = false;
  public showThumbnail = true;

  public documentUrl = null;

  // Swiping
  private touchElement: HTMLElement;
  private thumbElement: HTMLElement;
  private bodyScroll: number;
  private hammer: HammerManager;
  private disableSwipes: boolean;
  private velocityThreshold = 0.2;
  private screenWidth: number;
  private offscreenThreshold: number;
  private loadingRecord = false;

  // UI
  public useMinimalView = false;
  private bodyScrollTop: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private element: ElementRef,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
    private sanitizer: DomSanitizer
  ) {
    // store current scroll position in file list
    this.bodyScrollTop = window.scrollY;

    const resolvedRecord = route.snapshot.data.currentRecord;

    if (route.snapshot.data.singleFile) {
      this.currentRecord = resolvedRecord;
      this.records = [ this.currentRecord ];
      this.currentIndex = 0;
    } else {
      this.records = filter(this.dataService.currentFolder.ChildItemVOs, 'isRecord') as RecordVO[];
      this.currentIndex = findIndex(this.records, {folder_linkId: resolvedRecord.folder_linkId});
      this.currentRecord = this.records[this.currentIndex];
      if (resolvedRecord !== this.currentRecord) {
        this.currentRecord.update(resolvedRecord);
      }

      this.loadQueuedItems();
    }

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
    // this.hammer.on('tap', (evt: HammerInput) => {
    //   this.useMinimalView = !this.useMinimalView;
    // });

    this.screenWidth = this.touchElement.clientWidth;
    this.offscreenThreshold = this.screenWidth / 2;
  }

  ngOnDestroy() {
    // re-enable scrolling and return to initial scroll position
    this.document.body.style.setProperty('overflow', '');
    setTimeout(() => {
      window.scrollTo(0, this.bodyScrollTop);
    });
  }

  @HostListener('window:resize', [])
  onViewportResize(event) {
    this.screenWidth = this.touchElement.clientWidth;
    this.offscreenThreshold = this.screenWidth / 2;
  }

  // Keyboard
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) {
    switch (event.key) {
      case Key.ArrowLeft:
        this.incrementCurrentRecord(true);
        break;
      case Key.ArrowRight:
        this.incrementCurrentRecord();
        break;
    }
  }

  initRecord() {
    this.isVideo = this.currentRecord.type.includes('video');
    this.isPdf = this.currentRecord.type.includes('pdf');
    this.documentUrl = this.getPdfUrl();
  }

  getPdfUrl() {
    if (!this.isPdf) {
      return false;
    }

    const original = find(this.currentRecord.FileVOs, {format: 'file.format.original'}) as any;

    if (!original) {
      return false;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(original.fileURL);
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
      gsap.set(
        queuedThumbs,
        {
          x: (index, target) => {
            return evt.deltaX + (getOrder(target) * this.screenWidth);
          }
        }
      );
    } else if (!(fastEnough || farEnough) || !canNavigate) {
      // reset to center, not fast enough or far enough
      gsap.to(
        queuedThumbs,
        {
          duration: 0.5,
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
      gsap.to(
        queuedThumbs,
        {
          duration: 0.5,
          x: (index, target) => {
            return (getOrder(target) + offset) * this.screenWidth;
          },
          ease: 'Power4.easeOut',
          onComplete: () => {
            this.incrementCurrentRecord(previous);
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

  incrementCurrentRecord(previous = false) {
    if (this.loadingRecord) {
      return;
    }

    let targetIndex = this.currentIndex;
    if (previous) {
      targetIndex--;
    } else {
      targetIndex++;
    }

    if (!this.records[targetIndex]) {
      return;
    }

    this.loadingRecord = true;

    // update current record and fetch surrounding items
    const targetRecord = this.records[targetIndex];

    this.currentIndex = targetIndex;
    this.currentRecord = targetRecord;

    this.initRecord();

    this.disableSwipes = false;
    this.loadQueuedItems();

    if (targetRecord.archiveNbr) {
      this.navigateToCurrentRecord();
    } else if (targetRecord.isFetching) {
      targetRecord.fetched
        .then(() => {
          this.navigateToCurrentRecord();
        });
    } else {
      this.dataService.fetchLeanItems([targetRecord])
        .then(() => {
          this.navigateToCurrentRecord();
        });
    }
  }

  navigateToCurrentRecord() {
    this.router.navigate(['../', this.currentRecord.archiveNbr], {relativeTo: this.route});
    this.loadingRecord = false;
  }

  loadQueuedItems() {
    const surroundingCount = 5;
    const start = Math.max(this.currentIndex - surroundingCount, 0);
    const end = Math.min(this.currentIndex + surroundingCount + 1, this.records.length);
    const itemsToFetch = this.records.slice(start, end).filter((item: RecordVO) => item.dataStatus < DataStatus.Full );
    if (itemsToFetch.length) {
      this.dataService.fetchFullItems(itemsToFetch);
    }
  }

  close() {
    const routeParams = this.route.snapshot.params;
    let rootUrl = '/myfiles';

    this.router.navigate(['.'], { relativeTo: this.route.parent});
    return;

    if (this.router.routerState.snapshot.url.includes('/shares')) {
      if (this.router.routerState.snapshot.url.includes('/withme')) {
        rootUrl = '/shares/withme';
      } else {
        rootUrl = '/shares/byme';
      }
    } else if (this.router.routerState.snapshot.url.includes('/p/')) {
      rootUrl = `/p/${this.route.snapshot.params.publishUrlToken}`;
    }

    if (routeParams.archiveNbr) {
      this.router.navigate([rootUrl, routeParams.archiveNbr, routeParams.folderLinkId]);
    } else {
      this.router.navigate([rootUrl]);
    }
    return false;
  }

}
