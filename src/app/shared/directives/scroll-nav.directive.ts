import { Directive, ViewChildren, QueryList, AfterViewInit, ContentChildren, AfterContentInit } from '@angular/core';
import { ScrollSectionDirective } from './scroll-section.directive';
import debug from 'debug';
import { find } from 'lodash';

@Directive({
  selector: '[prScrollNav]',
  exportAs: 'prScrollNav'
})
export class ScrollNavDirective {
  @ContentChildren(ScrollSectionDirective, { descendants: true }) sections!: QueryList<ScrollSectionDirective>;

  private debug = debug('directive:scrollNavDirective');
  constructor() { }
  scrollToSection(sectionId: string) {
    console.log(this);
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
