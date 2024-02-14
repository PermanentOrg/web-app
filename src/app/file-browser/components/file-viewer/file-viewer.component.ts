/* @format */
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Inject,
  HostListener,
  Optional,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Key } from 'ts-key-enum';
import * as Hammer from 'hammerjs';
import { gsap } from 'gsap';
import { filter, findIndex, find } from 'lodash';
import { RecordVO, ItemVO, TagVOData, AccessRole } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { DataStatus } from '@models/data-status.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import type { KeysOfType } from '@shared/utilities/keysoftype';
import { Subscription } from 'rxjs';
import { TagsService } from '../../../core/services/tags/tags.service';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
})
export class FileViewerComponent implements OnInit, OnDestroy {
  // Record
  public currentRecord: RecordVO;
  public prevRecord: RecordVO;
  public nextRecord: RecordVO;
  public records: RecordVO[];
  public currentIndex: number;
  public isVideo = false;
  public isAudio = false;
  public isDocument = false;
  public showThumbnail = true;
  public isPublicArchive: boolean = false;
  public allowDownloads: boolean = false;
  public keywords: TagVOData[];
  public customMetadata: TagVOData[];

  public documentUrl = null;

  public canEdit: boolean;
  public canEditFieldsOnFullscreen = false;

  // Swiping
  private touchElement: HTMLElement;
  private thumbElement: HTMLElement;
  private bodyScroll: number;
  private hammer: HammerManager;
  private disableSwipes: boolean;
  private fullscreen: boolean;
  private velocityThreshold = 0.2;
  private screenWidth: number;
  private offscreenThreshold: number;
  private loadingRecord = false;

  // UI
  public useMinimalView = false;
  public editingDate: boolean = false;
  private bodyScrollTop: number;
  private tagSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private element: ElementRef,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
    public sanitizer: DomSanitizer,
    private accountService: AccountService,
    private editService: EditService,
    private tagsService: TagsService,
    @Optional() private publicProfile: PublicProfileService
  ) {
    // store current scroll position in file list
    this.bodyScrollTop = window.scrollY;

    const resolvedRecord = route.snapshot.data.currentRecord;

    if (route.snapshot.data.singleFile) {
      this.currentRecord = resolvedRecord;
      this.records = [this.currentRecord];
      this.currentIndex = 0;
    } else {
      this.records = filter(
        this.dataService.currentFolder.ChildItemVOs,
        'isRecord'
      ) as RecordVO[];
      this.currentIndex = findIndex(this.records, {
        folder_linkId: resolvedRecord.folder_linkId,
      });
      this.currentRecord = this.records[this.currentIndex];
      if (resolvedRecord !== this.currentRecord) {
        this.currentRecord.update(resolvedRecord);
      }

      this.loadQueuedItems();
    }

    if (route.snapshot.data?.isPublicArchive) {
      this.isPublicArchive = route.snapshot.data.isPublicArchive;
    }

    if (publicProfile) {
      publicProfile.archive$()?.subscribe((archive) => {
        this.allowDownloads = !!archive?.allowPublicDownload;
      });
    }

    this.canEdit =
      this.accountService.checkMinimumAccess(
        this.currentRecord.accessRole,
        AccessRole.Editor
      ) && !route.snapshot.data?.isPublicArchive;

    this.canEditFieldsOnFullscreen = this.canEdit && this.canEditOnFullScreen()

    this.tagSubscription = this.tagsService
      .getItemTags$()
      ?.subscribe((tags) => {
        this.customMetadata = tags?.filter((tag) =>
          tag.type.includes('type.tag.metadata')
        );
        this.keywords = tags?.filter(
          (tag) => !tag.type.includes('type.tag.metadata')
        );
      });
  }

  ngOnInit() {
    this.initRecord();

    // disable scrolling file list in background
    this.document.body.style.setProperty('overflow', 'hidden');

    // bind hammer events to thumbnail area
    this.touchElement =
      this.element.nativeElement.querySelector('.thumb-target');
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
    this.tagSubscription.unsubscribe();
  }

  @HostListener('window:resize', [])
  onViewportResize(event) {
    this.screenWidth = this.touchElement.clientWidth;
    this.offscreenThreshold = this.screenWidth / 2;
  }

  // Keyboard
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) {
    if (!this.fullscreen) {
      switch (event.key) {
        case Key.ArrowLeft:
          this.incrementCurrentRecord(true);
          break;
        case Key.ArrowRight:
          this.incrementCurrentRecord();
          break;
      }
    }
  }

  initRecord() {
    this.isAudio = this.currentRecord.type.includes('audio');
    this.isVideo = this.currentRecord.type.includes('video');
    this.isDocument = this.currentRecord.FileVOs?.some((obj: ItemVO) =>
      obj.type.includes('pdf')
    );
    this.documentUrl = this.getPdfUrl();
    this.setCurrentTags();
  }

  toggleSwipe(value: boolean) {
    this.disableSwipes = value;
  }

  toggleFullscreen(value: boolean) {
    this.fullscreen = value;
  }

  getPdfUrl() {
    if (!this.isDocument) {
      return false;
    }

    const original = find(this.currentRecord.FileVOs, {
      format: 'file.format.original',
    }) as any;
    const pdf = find(this.currentRecord.FileVOs, (f) =>
      f.type.includes('pdf')
    ) as any;

    let url;

    if (original?.type.includes('pdf')) {
      url = original?.fileURL;
    } else if (pdf) {
      url = pdf?.fileURL;
    }

    if (!url) {
      return false;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isQueued(indexToCheck: number) {
    return (
      indexToCheck >= this.currentIndex - 1 &&
      indexToCheck <= this.currentIndex + 1
    );
  }

  handlePanEvent(evt: HammerInput) {
    if (this.disableSwipes) {
      return;
    }

    const queuedThumbs = document.querySelectorAll('.thumb-wrapper.queue');

    const previous = evt.deltaX > 0;
    const next = evt.deltaX < 0;
    const canNavigate =
      (previous && this.records[this.currentIndex - 1]) ||
      (next && this.records[this.currentIndex + 1]);
    const fastEnough = Math.abs(evt.velocityX) > this.velocityThreshold;
    const farEnough = Math.abs(evt.deltaX) > this.offscreenThreshold;

    if (!evt.isFinal) {
      // follow pointer for panning
      gsap.set(queuedThumbs, {
        x: (index, target) => {
          return evt.deltaX + getOrder(target) * this.screenWidth;
        },
      });
    } else if (!(fastEnough || farEnough) || !canNavigate) {
      // reset to center, not fast enough or far enough
      gsap.to(queuedThumbs, {
        duration: 0.5,
        x: (index, target) => {
          return getOrder(target) * this.screenWidth;
        },
        ease: 'Power4.easeOut',
      } as any);
    } else {
      // send offscreen to left or right, depending on direction
      let offset = 1;
      if (evt.deltaX < 0) {
        offset = -1;
      }
      this.disableSwipes = true;
      gsap.to(queuedThumbs, {
        duration: 0.5,
        x: (index, target) => {
          return (getOrder(target) + offset) * this.screenWidth;
        },
        ease: 'Power4.easeOut',
        onComplete: () => {
          this.incrementCurrentRecord(previous);
        },
      } as any);
    }

    function getOrder(elem: HTMLElement) {
      if (elem.classList.contains('prev')) {
        return -1;
      }
      if (elem.classList.contains('next')) {
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
      targetRecord.fetched.then(() => {
        this.navigateToCurrentRecord();
      });
    } else {
      this.dataService.fetchLeanItems([targetRecord]).then(() => {
        this.navigateToCurrentRecord();
      });
    }
  }

  navigateToCurrentRecord() {
    this.router.navigate(['../', this.currentRecord.archiveNbr], {
      relativeTo: this.route,
    });
    this.loadingRecord = false;
  }

  loadQueuedItems() {
    const surroundingCount = 5;
    const start = Math.max(this.currentIndex - surroundingCount, 0);
    const end = Math.min(
      this.currentIndex + surroundingCount + 1,
      this.records.length
    );
    const itemsToFetch = this.records
      .slice(start, end)
      .filter((item: RecordVO) => item.dataStatus < DataStatus.Full);
    if (itemsToFetch.length) {
      this.dataService.fetchFullItems(itemsToFetch);
    }
  }

  close() {
    this.router.navigate(['.'], { relativeTo: this.route.parent });
  }

  public async onFinishEditing(
    property: KeysOfType<ItemVO, string>,
    value: string
  ): Promise<void> {
    this.editService.saveItemVoProperty(
      this.currentRecord as ItemVO,
      property,
      value
    );
  }

  public onLocationClick(): void {
    if (this.canEdit) {
      this.editService.openLocationDialog(this.currentRecord as ItemVO);
    }
  }

  public onTagsClick(type: string): void {
    if (this.canEdit) {
      this.editService.openTagsDialog(this.currentRecord as ItemVO, type);
    }
  }

  public onDateToggle(active: boolean): void {
    this.editingDate = active;
  }

  public onDownloadClick(): void {
    this.dataService.downloadFile(this.currentRecord);
  }

  private setCurrentTags(): void {
    this.keywords = this.currentRecord.TagVOs.filter(
      (tag) => !tag.type.includes('type.tag.metadata')
    );
    this.customMetadata = this.currentRecord.TagVOs.filter((tag) =>
      tag.type.includes('type.tag.metadata')
    );
  }

  private canEditOnFullScreen(): boolean {
    return (
      this.router.routerState.snapshot.url.includes('private/record') ||
      this.router.routerState.snapshot.url.includes('public/record') ||
      this.router.routerState.snapshot.url.includes('shares/record')
    );
  }
}
