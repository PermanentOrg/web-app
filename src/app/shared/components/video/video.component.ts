import { Component, OnInit, Input, ElementRef, Renderer } from '@angular/core';
import { TweenMax } from 'gsap';

import { RecordVO } from '@root/app/models';

const FADE_IN_DURATION = 0.3;

@Component({
  selector: 'pr-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() item: RecordVO;

  private videoElem: Element;
  public videoSrc: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  ngOnInit() {
    this.videoElem = this.elementRef.nativeElement.querySelector('video');

    this.videoElem.addEventListener('canplay', (event) => {
      this.renderer.setElementClass(this.videoElem, 'loading', false);
      TweenMax.from(
        this.videoElem,
        FADE_IN_DURATION,
        {
          opacity: 0,
          ease: 'Power4.easeOut'
        }
      );
    });

    const fileVO = this.item.FileVOs[0];
    this.videoSrc = fileVO.fileURL;
  }

}
