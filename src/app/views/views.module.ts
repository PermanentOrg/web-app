import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { RouterModule } from '@angular/router';
import { TimelineBreadcrumbsComponent } from './components/timeline-view/timeline-breadcrumbs/timeline-breadcrumbs.component';

@NgModule({
  declarations: [TimelineViewComponent, TimelineBreadcrumbsComponent],
  exports: [
    TimelineViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ViewsModule { }
