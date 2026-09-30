import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@shared/shared.module';

import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { TimelineBreadcrumbsComponent } from './components/timeline-view/timeline-breadcrumbs/timeline-breadcrumbs.component';
import { SlideshowViewComponent } from './components/slideshow-view/slideshow-view.component';

@NgModule({
	imports: [CommonModule, RouterModule, SharedModule, NgbCarouselModule],
	exports: [TimelineViewComponent, SlideshowViewComponent],
	declarations: [
		TimelineViewComponent,
		TimelineBreadcrumbsComponent,
		SlideshowViewComponent,
	],
})
export class ViewsComponentsModule {}
