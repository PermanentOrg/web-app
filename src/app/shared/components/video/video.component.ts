import { Component, OnInit, Input, ElementRef, Renderer } from '@angular/core';
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

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  ngOnInit() {
    this.videoElem = this.elementRef.nativeElement.querySelector('video');
    this.videoWrapperElem = this.elementRef.nativeElement.querySelector('.pr-video-wrapper');

    this.videoElem.addEventListener('canplay', (event) => {
      this.renderer.setElementClass(this.videoWrapperElem, 'loading', false);
      TweenMax.from(
        this.videoElem,
        FADE_IN_DURATION,
        {
          opacity: 0,
          ease: 'Power4.easeOut'
        }
      );
    });

    const mp4File = find(this.item.FileVOs, {type: 'type.file.video.mp4'}) as any;

    console.log('video.component.ts', 42, mp4File);
    if (mp4File) {
      this.videoSrc = mp4File.fileURL;
      this.isProcessing = false;
    } else {
      this.renderer.setElementClass(this.videoWrapperElem, 'loading', false);
      this.isProcessing = true;
    }
  }

}
