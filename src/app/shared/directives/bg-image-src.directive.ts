import { Directive, Input, OnInit, OnChanges, ElementRef, Renderer, SimpleChanges } from '@angular/core';
import { TweenMax } from 'gsap';

const FADE_IN_DURATION = 0.3;

@Directive({
  selector: '[prBgImage]',
})
export class BgImageSrcDirective implements OnInit, OnChanges {
  @Input() bgSrc: string;
  @Input() cover: boolean;

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

  ngOnChanges(changes: SimpleChanges) {
    this.setBgImage(changes);
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

  setBgImage(changes?: SimpleChanges) {
    if (!this.bgSrc) {
      this.renderer.setElementStyle(this.element, 'background-image', '');
      this.renderer.setElementClass(this.element, 'bg-image-loaded', false);
    } else {
      this.loadBgImage();
    }

    this.renderer.setElementClass(this.element, 'bg-image-cover', this.cover);
  }

}
