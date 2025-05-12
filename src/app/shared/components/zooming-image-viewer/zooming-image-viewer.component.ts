/* @format */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { GetAccessFile } from '@models/get-access-file';
import { RecordVO } from '@models/index';
import * as OpenSeaDragon from 'openseadragon';
import { ZoomEvent, FullScreenEvent } from 'openseadragon';

@Component({
  selector: 'pr-zooming-image-viewer',
  templateUrl: './zooming-image-viewer.component.html',
  styleUrl: './zooming-image-viewer.component.scss',
})
export class ZoomingImageViewerComponent implements AfterViewInit, OnDestroy {
  @Input() public item: RecordVO;

  @Output() public disableSwipe = new EventEmitter<boolean>(false);
  @Output() public isFullScreen = new EventEmitter<boolean>(false);

  public viewer: OpenSeaDragon.Viewer;

  private initialZoom: number;

  @ViewChild('viewer') element!: ElementRef<HTMLElement>;

  constructor(
    @Inject('openseadragon') private imageViewerFn: typeof OpenSeaDragon,
  ) {}

  public ngAfterViewInit() {
    const viewerDiv = this.element.nativeElement;

    if (
      viewerDiv &&
      this.item instanceof RecordVO &&
      this.item.files &&
      this.item.type === 'type.record.image'
    ) {
      const fullSizeImage = ZoomingImageViewerComponent.chooseFullSizeImage(
        this.item,
      );
      if (fullSizeImage == null) {
        return;
      }
      this.viewer = this.imageViewerFn({
        element: viewerDiv,
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

        this.disableSwipe.emit(zoom > this.initialZoom);

        this.enablePanning(zoom > 1);
      });

      this.viewer.addHandler('full-screen', (event: FullScreenEvent) => {
        const { fullScreen } = event;
        this.isFullScreen.emit(fullScreen);
      });
    }
  }

  public ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  public static chooseFullSizeImage(record: RecordVO) {
    return GetAccessFile(record)?.fileUrl;
  }

  private enablePanning(flag: boolean): void {
    (this.viewer as OpenSeaDragon.Options).panHorizontal = flag;
    (this.viewer as OpenSeaDragon.Options).panVertical = flag;
  }
}
