import { Directive, Input, OnInit, OnChanges, ElementRef, Renderer } from '@angular/core';
import { TweenMax } from 'gsap';

const FADE_IN_DURATION = 0.3;

@Directive({
  selector: '[prBgImage]',
})
export class BgImageSrcDirective implements OnInit, OnChanges {
  @Input() bgSrc: string;

  private element: Element;
  private fadeIn = false;

  constructor(element: ElementRef, private renderer: Renderer) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this.setBgImage();
    if (!this.bgSrc) {
      this.fadeIn = true;
    }
  }

  ngOnChanges() {
    this.setBgImage();
  }

  loadBgImage() {
    const bgImage = new Image();
    bgImage.onload = () => {
      this.renderer.setElementStyle(this.element, 'background-image', `url(${this.bgSrc})`);
      this.renderer.setElementClass(this.element, 'bg-image-loaded', true);
      if (this.fadeIn) {
        this.fadeIn = false;
        TweenMax.from(
          this.element,
          FADE_IN_DURATION,
          {
            opacity: 0,
            ease: 'Power4.easeOut'
          }
        );
      }
    };
    bgImage.src = this.bgSrc;
  }

  setBgImage() {
    if (!this.bgSrc) {
      this.renderer.setElementStyle(this.element, 'background-image', '');
      this.renderer.setElementClass(this.element, 'bg-image-loaded', false);
    } else {
      this.loadBgImage();
    }
  }

}
