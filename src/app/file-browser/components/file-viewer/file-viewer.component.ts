import { Component, OnInit, OnDestroy, ElementRef, Inject, AfterViewInit, Renderer, Renderer2} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import * as Hammer from 'hammerjs';
import { TweenMax } from 'gsap';

import { RecordVO } from '@root/app/models';
import { DataService } from '@shared/services/data/data.service';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  public record: RecordVO;
  public prevRecord: RecordVO;
  public nextRecord: RecordVO;

  private viewerElement: HTMLElement;
  private thumbElement: HTMLElement;
  private bodyScroll: number;
  private hammer: HammerManager;

  private velocityThreshold = 0.2;
  private offscreenThreshold: number;

  public showThumbnail = true;
  public isVideo = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private element: ElementRef,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2
  ) {
    this.record = route.snapshot.data.currentRecord;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.viewerElement = this.element.nativeElement.querySelector('.file-viewer');
    this.document.body.style.setProperty('overflow', 'hidden');

    this.isVideo = this.record.type.includes('video');

    this.dataService.getPrevNextRecord(this.record)
      .then((results) => {
        this.prevRecord = results.prev;
        this.nextRecord = results.next;
      });
  }

  ngAfterViewInit() {
    this.thumbElement = this.element.nativeElement.querySelector('#main-thumb') as HTMLElement;
    this.hammer = new Hammer(this.thumbElement);

    this.offscreenThreshold = this.thumbElement.clientWidth / 2;

    this.hammer.on('pan', (evt: HammerInput) => {
      this.handlePanEvent(evt);
    });
  }

  ngOnDestroy() {
    this.document.body.style.setProperty('overflow', '');
  }

  handlePanEvent(evt: HammerInput) {
    const allThumbs = document.querySelectorAll('.thumb-wrapper');
    const screenWidth = this.thumbElement.clientWidth;
    const previous = evt.deltaX > 0;
    const next = evt.deltaX < 0;
    const canNavigate = (previous && this.prevRecord) || (next && this.nextRecord);
    const fastEnough = Math.abs(evt.velocityX) > this.velocityThreshold;
    const farEnough = Math.abs(evt.deltaX) > this.offscreenThreshold;
    if (!evt.isFinal) {
      // follow pointer for panning
      TweenMax.set(
        allThumbs,
        {
          x: (index, target) => {
            return evt.deltaX + ((index - 1) * screenWidth);
          }
        }
      );
    } else if (!(fastEnough || farEnough) || !canNavigate) {
      // reset to center, not fast enough or far enough
      TweenMax.to(
        allThumbs,
        0.5,
        {
          x: (index, target) => {
            return (index - 1) * screenWidth;
          },
          ease: 'Power4.easeOut',
        } as any
      );
    } else {
      // send offscreen to left or right, depending on direction
      let offset = 0;
      if (evt.deltaX < 0) {
        offset = -2;
      }
      TweenMax.to(
        allThumbs,
        0.5,
        {
          x: (index, target) => {
            return (index + offset) * screenWidth;
          },
          ease: 'Power4.easeOut',
          onComplete: () => {
            if (previous) {
              this.router.navigate(['../', this.prevRecord.archiveNbr], {relativeTo: this.route});
            } else {
              this.router.navigate(['../', this.nextRecord.archiveNbr], {relativeTo: this.route});
            }
          }
        } as any
      );
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
