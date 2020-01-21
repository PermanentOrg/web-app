import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { TweenMax } from 'gsap';
import { find } from 'lodash';

import { RecordVO } from '@root/app/models';

const FADE_IN_DURATION = 0.3;

@Component({
  selector: 'pr-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() item: RecordVO;

  private videoWrapperElem: Element;
  private videoElem: Element;
  public videoSrc: string;
  public isProcessing: boolean;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.videoElem = this.elementRef.nativeElement.querySelector('video');
    this.videoWrapperElem = this.elementRef.nativeElement.querySelector('.pr-video-wrapper');

    this.videoElem.addEventListener('loadstart', (event) => {
      setTimeout(() => {
        this.renderer.removeClass(this.videoWrapperElem, 'loading');
        TweenMax.from(
          this.videoElem,
          FADE_IN_DURATION,
          {
            opacity: 0,
            ease: 'Power4.easeOut'
          }
        );
      }, 250);
    });

    const convertedFile = find(this.item.FileVOs, {type: 'type.file.video.mp4', format: 'file.format.converted'}) as any;
    const originalFile = find(this.item.FileVOs, {format: 'file.format.original'}) as any;

    if (convertedFile) {
      this.videoSrc = convertedFile.fileURL;
      this.isProcessing = false;
    } else if (originalFile) {
      this.videoSrc = originalFile.fileURL;
      this.isProcessing = false;
    } else {
      this.renderer.removeClass(this.videoWrapperElem, 'loading');
      this.isProcessing = true;
    }
  }

}
