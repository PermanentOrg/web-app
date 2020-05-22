import { Component, OnInit, Input, ElementRef, HostListener, DoCheck, OnChanges, Renderer2, NgZone } from '@angular/core';

import { debounce } from 'lodash';
import debug from 'debug';

import { FolderVO, RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

const THUMB_SIZES = [200, 500, 1000, 2000];

@Component({
  selector: 'pr-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, OnChanges, DoCheck {
  @Input() item: ItemVO;

  thumbLoaded = false;

  private element: Element;
  private imageElement: Element;

  private targetThumbWidth: number;
  private currentThumbWidth = 200;
  private currentThumbUrl: string;
  private dpiScale = 1;

  private lastItemDataStatus: DataStatus;

  private debouncedResize;
  private debug = debug('component:thumbnail');

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone
  ) {
    this.element = elementRef.nativeElement;
    this.debouncedResize = debounce(this.checkElementWidth, 100);
    this.dpiScale = (window ? window.devicePixelRatio > 1.75 : false) ? 2 : 1;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (!this.imageElement) {
      this.getImageElement();
    }
    this.resetImage();
  }

  ngDoCheck() {
    if (this.item.dataStatus !== this.lastItemDataStatus) {
      this.debug('change detection from data status');
      this.resetImage();
    }
  }

  getImageElement() {
    this.imageElement = this.element.querySelector('.pr-thumbnail-image');
  }

  resetImage() {
    this.setImageBg(this.item.thumbURL200);
    this.currentThumbWidth = 200;
    this.targetThumbWidth = 200;
    this.checkElementWidth();
    this.lastItemDataStatus = this.item.dataStatus;
  }

  @HostListener('window:resize', [])
  onViewportResize(event) {
    this.debouncedResize();
  }

  checkElementWidth() {
    const elemSize = this.element.clientWidth * this.dpiScale;
    if (elemSize <= this.currentThumbWidth) {
      return;
    }
    let targetWidth;

    for (const size of THUMB_SIZES) {
      if (elemSize <= size) {
        targetWidth = size;
      } else if (elemSize >= THUMB_SIZES[THUMB_SIZES.length - 1]) {
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
          this.renderer.setStyle(this.imageElement, 'background-image', `url(${imageUrl})`);
        }
      };
      imageLoader.src = imageUrl;
    }
  }


}
