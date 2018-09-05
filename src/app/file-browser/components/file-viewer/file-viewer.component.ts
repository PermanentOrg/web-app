import { Component, OnInit, OnDestroy, ElementRef, Inject, AfterViewInit, Renderer, Renderer2} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import * as Hammer from 'hammerjs';
import { TweenMax } from 'gsap';

import { RecordVO } from '@root/app/models';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  record: RecordVO;

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
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2
  ) {
    this.record = route.snapshot.data.currentRecord;
  }

  ngOnInit() {
    this.viewerElement = this.element.nativeElement.querySelector('.file-viewer');
    this.document.body.style.setProperty('overflow', 'hidden');

    this.isVideo = this.record.type.includes('video');
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
    if (!evt.isFinal) {
      this.renderer.setStyle(this.thumbElement, 'transform', `translateX(${evt.deltaX}px)`);
    } else if (Math.abs(evt.velocityX) <= this.velocityThreshold && Math.abs(evt.deltaX) <= this.offscreenThreshold) {
      TweenMax.fromTo(
        this.thumbElement,
        0.5,
        {
          x: evt.deltaX
        },
        {
          x: 0,
          ease: 'Power4.easeOut'
        } as any
      );
    } else {
      let offscreenX = this.thumbElement.clientWidth + 10;
      if (evt.deltaX < 0) {
        offscreenX = -1 * offscreenX;
      }
      TweenMax.fromTo(
        this.thumbElement,
        0.5,
        {
          x: evt.deltaX
        },
        {
          x: offscreenX,
          ease: 'Power4.easeOut'
        }
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
