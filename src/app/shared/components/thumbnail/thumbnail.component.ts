/* @format */
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  DoCheck,
  OnChanges,
  Renderer2,
  NgZone,
  OnDestroy,
  AfterContentInit,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';

import { debounce } from 'lodash';
import debug from 'debug';

import { FolderVO, RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import * as OpenSeaDragon from 'openseadragon';
import { ViewerEvent } from 'openseadragon';

const THUMB_SIZES = [200, 500, 1000, 2000];

@Component({
  selector: 'pr-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent
  implements OnChanges, DoCheck, OnDestroy, AfterViewInit
{
  @Input() item: ItemVO;
  @Input() maxWidth;

  thumbLoaded = false;

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

  viewer: OpenSeaDragon.Viewer;

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone
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
      this.item.FileVOs
    ) {
      this.viewer = OpenSeaDragon({
        element: resizableImageElement as HTMLElement,
        prefixUrl: 'assets/openseadragon/images/',
        tileSources: { type: 'image', url: this.item?.FileVOs[0].fileURL },
        visibilityRatio: 1.0,
        constrainDuringPan: true,
        maxZoomLevel: 10,
      });

      this.viewer.addHandler('zoom', (event: OpenSeaDragon.ZoomEvent) => {
        const zoom = event.zoom;
        if (!this.initialZoom) {
          this.initialZoom = zoom;
        }

        if (zoom !== this.initialZoom) {
          this.disableSwipe.emit(true);
        } else {
          this.disableSwipe.emit(false);
        }
      });
    }
  }

  ngOnChanges() {
    if (!this.imageElement) {
      this.getImageElement();
    }
    this.resetImage();
  }

  ngDoCheck() {
    if (this.item.dataStatus !== this.lastItemDataStatus) {
      this.resetImage();
    }
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
            `url(${imageUrl})`
          );
        }
      };

      imageLoader.src = imageUrl;
    }
  }
}
