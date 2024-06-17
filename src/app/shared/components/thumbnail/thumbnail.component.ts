/* @format */
import {
  Component,
  Input,
  ElementRef,
  HostListener,
  DoCheck,
  Renderer2,
  NgZone,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';

import { debounce } from 'lodash';
import debug from 'debug';

import { RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import * as OpenSeaDragon from 'openseadragon';
import { ZoomEvent, FullScreenEvent } from 'openseadragon';

const THUMB_SIZES = [200, 500, 1000, 2000];

@Component({
  selector: 'pr-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements DoCheck, OnDestroy, AfterViewInit {
  @Input() item: ItemVO;
  @Input() maxWidth;

  thumbLoaded = false;

  private lastItemFolderLinkId: number;
  private lastMaxWidth: number;

  private element: Element;
  private imageElement: Element;
  private resizableImageElement: Element;

  private initialZoom: number;

  private targetThumbWidth: number;
  private currentThumbWidth = 200;
  private currentThumbUrl: string;
  private dpiScale = 1;

  private lastItemDataStatus: DataStatus;

  private debouncedResize;
  private debug = debug('component:thumbnail');

  public isZip: boolean = false;

  @Input() hideResizableImage: boolean = true;
  @Output() disableSwipe = new EventEmitter<boolean>(false);
  @Output() isFullScreen = new EventEmitter<boolean>(false);

  viewer: OpenSeaDragon.Viewer;

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone,
  ) {
    this.element = elementRef.nativeElement;
    this.debouncedResize = debounce(this.checkElementWidth, 100);
    this.dpiScale = (window ? window.devicePixelRatio > 1.75 : false) ? 2 : 1;
  }

  ngAfterViewInit() {
    const resizableImageElement = this.element.querySelector('#openseadragon');

    if (
      resizableImageElement &&
      this.item instanceof RecordVO &&
      this.item.FileVOs &&
      this.item.type === 'type.record.image'
    ) {
      const fullSizeImage = this.chooseFullSizeImage(this.item);
      if (fullSizeImage == null) {
        return;
      }
      this.viewer = OpenSeaDragon({
        element: resizableImageElement as HTMLElement,
        prefixUrl: 'assets/openseadragon/images/',
        tileSources: { type: 'image', url: fullSizeImage },
        visibilityRatio: 1.0,
        constrainDuringPan: true,
        maxZoomLevel: 10,
      });

      this.viewer.addHandler('zoom', (event: ZoomEvent) => {
        const zoom = event.zoom;
        if (!this.initialZoom) {
          this.initialZoom = zoom;
        }

        if (zoom > this.initialZoom) {
          this.disableSwipe.emit(true);
        } else {
          this.disableSwipe.emit(false);
        }

        if (zoom <= 1) {
          this.enablePanning(false);
        } else {
          this.enablePanning(true);
        }
      });

      this.viewer.addHandler('full-screen', (event: FullScreenEvent) => {
        const { fullScreen } = event;
        this.isFullScreen.emit(fullScreen);
      });
    }
  }

  ngDoCheck() {
    if (!this.imageElement) {
      this.getImageElement();
    }
    if (this.shouldResetImage()) {
      this.resetImage();
    }
  }

  private shouldResetImage(): boolean {
    return (
      this.item.folder_linkId !== this.lastItemFolderLinkId ||
      this.maxWidth !== this.lastMaxWidth ||
      this.item.dataStatus !== this.lastItemDataStatus
    );
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  getImageElement() {
    this.imageElement = this.element.querySelector('.pr-thumbnail-image');
  }

  resetImage() {
    this.lastItemFolderLinkId = this.item.folder_linkId;
    this.lastMaxWidth = this.maxWidth;
    if (!this.item.isFolder) {
      this.isZip = this.item.type === 'type.record.archive';
      this.setImageBg(this.item.thumbURL200);
      this.currentThumbWidth = 200;
      this.targetThumbWidth = 200;
      this.checkElementWidth();
      this.lastItemDataStatus = this.item.dataStatus;
    } else {
      this.isZip = false;
      this.setImageBg();
      this.currentThumbWidth = 200;
      this.targetThumbWidth = 200;
      this.lastItemDataStatus = this.item.dataStatus;
    }
  }

  @HostListener('window:resize', [])
  onViewportResize(event) {
    this.debouncedResize();
  }

  checkElementWidth() {
    const elemSize = this.element.clientWidth * this.dpiScale;
    const checkSize = this.maxWidth
      ? Math.min(this.maxWidth, elemSize)
      : elemSize;
    if (checkSize <= this.currentThumbWidth) {
      return;
    }
    let targetWidth;

    for (const size of THUMB_SIZES) {
      if (checkSize <= size) {
        targetWidth = size;
      } else if (checkSize >= THUMB_SIZES[THUMB_SIZES.length - 1]) {
        targetWidth = THUMB_SIZES[THUMB_SIZES.length - 1];
      }

      if (targetWidth) {
        break;
      }
    }

    this.targetThumbWidth = targetWidth;
    this.checkItemThumbs();
  }

  checkItemThumbs() {
    const targetUrl = this.item[`thumbURL${this.targetThumbWidth}`];
    if (targetUrl) {
      this.currentThumbWidth = this.targetThumbWidth;
      this.setImageBg(targetUrl);
    }
  }

  setImageBg(imageUrl?: string) {
    this.currentThumbUrl = imageUrl;

    if (!imageUrl) {
      this.renderer.addClass(this.imageElement, 'image-loading');
    } else {
      const imageLoader = new Image();
      const targetFolderLinkId = this.item.folder_linkId;
      imageLoader.onload = () => {
        this.thumbLoaded = true;
        this.renderer.removeClass(this.imageElement, 'image-loading');
        if (this.item.folder_linkId === targetFolderLinkId) {
          this.renderer.setStyle(
            this.imageElement,
            'background-image',
            `url(${imageUrl})`,
          );
        }
      };

      imageLoader.src = imageUrl;
    }
  }

  chooseFullSizeImage(record: RecordVO) {
    if (record.FileVOs.length > 1) {
      const convertedUrl = record.FileVOs.find(
        (file) => file.format == 'file.format.converted',
      ).fileURL;
      return convertedUrl;
    } else {
      return record.FileVOs[0]?.fileURL;
    }
  }

  public enablePanning(flag: boolean): void {
    (this.viewer as OpenSeaDragon.Options).panHorizontal = flag;
    (this.viewer as OpenSeaDragon.Options).panVertical = flag;
  }
}
