import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[prScrollSection]',
  standalone: false,
})
export class ScrollSectionDirective {
  @Input('prScrollSection') sectionId: string;
  element: HTMLElement;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }
}
