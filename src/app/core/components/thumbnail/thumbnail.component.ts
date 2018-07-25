import { Component, OnInit, Input, ElementRef, Renderer, HostListener, DoCheck } from '@angular/core';

import { debounce } from 'lodash';

import { FolderVO, RecordVO } from '@root/app/models';

const THUMB_SIZES = [200, 500, 1000, 2000];

@Component({
  selector: 'pr-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit {
  @Input() item: FolderVO | RecordVO;

  thumbLoaded = false;

  private element: Element;
  private imageElement: Element;
  private placeholderElement: Element;

  private targetThumbWidth: number;
  private currentThumbWidth = 200;
  private currentThumbUrl: string;
  private dpiScale = 1;

  private debouncedResize;
  constructor(elementRef: ElementRef, private renderer: Renderer) {
    this.element = elementRef.nativeElement;
    this.debouncedResize = debounce(this.checkElementWidth, 100);
    this.dpiScale = (window ? window.devicePixelRatio > 1.75 : false) ? 2 : 1;
  }

  ngOnInit() {
    this.imageElement = this.element.querySelector('.pr-thumbnail-image');
    this.placeholderElement = this.element.querySelector('.pr-thumbnail-placeholder');
    this.setPlaceholderSize();
    this.setImageBg(this.item.thumbURL200);
    this.checkElementWidth();
  }

  @HostListener('window:resize', [])
  onViewportResize(event) {
    this.debouncedResize();
  }

  setPlaceholderSize() {
    if (this.item.imageRatio > 1) {
      this.renderer.setElementClass(this.placeholderElement, 'tall', true);
      this.renderer.setElementClass(this.placeholderElement, 'wide', false);
    } else {
      this.renderer.setElementClass(this.placeholderElement, 'tall', true);
      this.renderer.setElementClass(this.placeholderElement, 'wide', false);
    }
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
        targetWidth = size;
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

  setImageBg(imageUrl) {
    this.currentThumbUrl = imageUrl;
    if (!imageUrl) {
      this.renderer.setElementStyle(this.imageElement, 'background-image', ``);
    } else {
      const imageLoader = new Image();
      imageLoader.onload = () => {
        this.thumbLoaded = true;
        this.renderer.setElementStyle(this.imageElement, 'background-image', `url(${imageUrl})`);
      };
      imageLoader.src = imageUrl;
    }
  }


}
