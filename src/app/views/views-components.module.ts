import { NgModule, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { TimelineBreadcrumbsComponent } from './components/timeline-view/timeline-breadcrumbs/timeline-breadcrumbs.component';

@NgModule({
	imports: [CommonModule, RouterModule, SharedModule],
	exports: [TimelineViewComponent],
	declarations: [TimelineViewComponent, TimelineBreadcrumbsComponent],
})
export class ViewsComponentsModule {}
