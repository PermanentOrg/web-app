import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewsComponentsModule } from './views-components.module';
import { ViewsRoutingModule } from './views.routes';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    RouterModule,
    ViewsComponentsModule,
    ViewsRoutingModule,
  ],
})
export class ViewsModule {}
