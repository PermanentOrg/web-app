import { Directive, ViewChildren, QueryList, AfterViewInit, ContentChildren, AfterContentInit, OnDestroy, ElementRef } from '@angular/core';
import { ScrollSectionDirective } from './scroll-section.directive';
import debug from 'debug';
import { find, maxBy, some, minBy } from 'lodash';

@Directive({
  selector: '[prScrollNav]',
  exportAs: 'prScrollNav'
})
export class ScrollNavDirective implements AfterContentInit, OnDestroy {
  @ContentChildren(ScrollSectionDirective, { descendants: true }) sections!: QueryList<ScrollSectionDirective>;

  private debug = debug('directive:scrollNavDirective');

  private observerOptions: IntersectionObserverInit = {
    threshold: 0.75,
  };
  private observer: IntersectionObserver;

  activeSectionId: string;
  constructor(
    private elementRef: ElementRef
  ) { }

  ngAfterContentInit(): void {
    const sections = this.sections.toArray();
    this.observer = new IntersectionObserver(
      () => { this.onIntersection(); },
      this.observerOptions
    );
    for (const section of sections) {
      this.observer.observe(section.element);
    }
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  onIntersection() {
    this.debug('change in visible! check sections');
    const scrollElem = this.elementRef.nativeElement as HTMLElement;
    const topOfScroll = scrollElem.getBoundingClientRect().y;
    const visibleSections = this.sections.toArray().filter(s => s.element.getBoundingClientRect().y >= topOfScroll);

    this.debug('visible sections %o', visibleSections.map(s => s.sectionId));

    let targetSection: ScrollSectionDirective;
    if (!visibleSections.length) {
      this.debug('all sections offscreen, get the last one');
      targetSection = this.sections.toArray().pop();
    } else {
      targetSection = minBy(visibleSections, s => s.element.getBoundingClientRect().y);
    }

    this.debug('target section %s', targetSection.sectionId);
    this.activeSectionId = targetSection.sectionId;
  }

  scrollToSection(sectionId: string) {
    this.debug('looking for %s', sectionId);

    const sections = this.sections.toArray();
    const targetSection = find(sections, { sectionId });
    if (targetSection) {
      this.debug('section found %o', targetSection);
      targetSection.element.scrollIntoView();
    } else {
      this.debug('section not found!');
    }
  }
}
