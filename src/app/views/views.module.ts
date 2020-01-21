import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';

@NgModule({
  declarations: [TimelineViewComponent],
  exports: [
    TimelineViewComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ViewsModule { }
