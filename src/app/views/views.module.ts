import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TimelineViewComponent],
  exports: [
    TimelineViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ViewsModule { }
