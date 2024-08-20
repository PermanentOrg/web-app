/* @format */
import {
  Component,
  Input,
  ElementRef,
  HostListener,
  DoCheck,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  Inject,
  OnInit,
} from '@angular/core';

import { debounce } from 'lodash';
import { RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import * as OpenSeaDragon from 'openseadragon';
import { ZoomEvent, FullScreenEvent } from 'openseadragon';
import { GetThumbnailInfo } from '@models/get-thumbnail';

@Component({
  selector: 'pr-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent
  implements OnInit, DoCheck, OnDestroy, AfterViewInit
{
  @Input() public item: ItemVO;
  @Input() public maxWidth: number | undefined;
  @Input() public hideResizableImage: boolean = true;

  @Output() public disableSwipe = new EventEmitter<boolean>(false);
  @Output() public isFullScreen = new EventEmitter<boolean>(false);

  public thumbLoaded = false;
  public isZip = false;
  public viewer: OpenSeaDragon.Viewer;
  public imageUrl: string | undefined;

  private lastItemFolderLinkId: number;
  private lastMaxWidth: number;

  private element: Element;
  private resizableImageElement: Element;

  private initialZoom: number;

  private targetThumbWidth: number;
  private currentThumbUrl: string;
  private dpiScale = 1;

  private lastItemDataStatus: DataStatus;

  private debouncedResize: () => void | undefined;

  constructor(
    elementRef: ElementRef,
    @Inject('Image') private imageClass: typeof Image,
  ) {
    this.element = elementRef.nativeElement;
    this.debouncedResize = debounce(this.calculateWidthsAndSetImageBg, 100);
    this.dpiScale = window?.devicePixelRatio > 1.75 ? 2 : 1;
  }

  public ngAfterViewInit() {
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

  public ngOnInit(): void {
    this.resetImage();
  }

  public ngDoCheck() {
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

  public ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  public resetImage() {
    this.lastItemFolderLinkId = this.item.folder_linkId;
    this.lastMaxWidth = this.maxWidth;
    this.lastItemDataStatus = this.item.dataStatus;
    this.isZip = this.item.type === 'type.record.archive';
    this.calculateWidthsAndSetImageBg();
  }

  @HostListener('window:resize', [])
  public onViewportResize() {
    this.debouncedResize();
  }

  public calculateWidthsAndSetImageBg() {
    const elemSize = this.element.clientWidth * this.dpiScale;
    const checkSize = this.maxWidth
      ? Math.min(this.maxWidth, elemSize)
      : elemSize;

    const thumbInfo = GetThumbnailInfo(this.item, checkSize);
    this.targetThumbWidth = thumbInfo?.size ?? 200;
    this.setImageBg(thumbInfo?.url);
  }

  public setImageBg(imageUrl?: string) {
    this.currentThumbUrl = imageUrl;

    if (imageUrl) {
      const imageLoader = new this.imageClass();
      const targetFolderLinkId = this.item.folder_linkId;
      imageLoader.onload = () => {
        this.thumbLoaded = true;
        if (this.item.folder_linkId === targetFolderLinkId) {
          this.imageUrl = imageUrl;
        }
      };

      imageLoader.src = imageUrl;
    }
  }

  public chooseFullSizeImage(record: RecordVO) {
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

  public getCurrentThumbUrl(): string {
    return this.currentThumbUrl;
  }

  public getTargetThumbWidth(): number {
    return this.targetThumbWidth;
  }
}
