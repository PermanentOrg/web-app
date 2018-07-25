import { Directive, Input, OnInit, OnChanges, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[prBgImage]',
})
export class BgImageSrcDirective implements OnInit, OnChanges {
  @Input() bgSrc: string;

  private element: Element;

  constructor(element: ElementRef, private renderer: Renderer) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this.setBgImage();
  }

  ngOnChanges() {
    this.setBgImage();
  }

  loadBgImage() {
    const bgImage = new Image();
    bgImage.onload = () => {
      this.renderer.setElementStyle(this.element, 'background-image', `url(${this.bgSrc})`);
      this.renderer.setElementClass(this.element, 'bg-image-loaded', true);
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
