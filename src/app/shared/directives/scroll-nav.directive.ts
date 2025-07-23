import {
  Directive,
  QueryList,
  ContentChildren,
  AfterContentInit,
  ElementRef,
  HostListener,
} from '@angular/core';
import debug from 'debug';
import { find, throttle } from 'lodash';
import { ScrollSectionDirective } from './scroll-section.directive';

@Directive({
  selector: '[prScrollNav]',
  exportAs: 'prScrollNav',
  standalone: false,
})
export class ScrollNavDirective implements AfterContentInit {
  @ContentChildren(ScrollSectionDirective, { descendants: true })
  sections!: QueryList<ScrollSectionDirective>;

  private debug = debug('directive:scrollNavDirective');

  private throttledHandler = throttle(() => {
    this.checkActiveSection();
  }, 64);

  activeSectionId: string;
  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.checkActiveSection();
    });
  }

  @HostListener('scroll', ['$event'])
  onViewportScroll(event: Event) {
    this.throttledHandler();
  }

  checkActiveSection() {
    const scrollElem = this.elementRef.nativeElement as HTMLElement;
    const scrollFromBottom =
      scrollElem.scrollHeight - scrollElem.clientHeight - scrollElem.scrollTop;
    const scrollElemRect = scrollElem.getBoundingClientRect();
    const threshold = scrollElemRect.top + 280;
    const pastThreshold = this.sections
      .toArray()
      .filter((s) => s.element.getBoundingClientRect().y <= threshold);

    if (scrollFromBottom > 50) {
      this.activeSectionId = pastThreshold.pop().sectionId;
    } else {
      // last item isn't tall enough to cross threshold
      this.activeSectionId = this.sections.toArray().pop().sectionId;
    }
  }

  scrollToSection(sectionId: string) {
    this.debug('looking for %s', sectionId);

    const sections = this.sections.toArray();
    const targetSection = find(sections, { sectionId });
    if (targetSection) {
      this.debug('section found %o', targetSection);
      targetSection.element.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.debug('section not found!');
    }
  }
}
