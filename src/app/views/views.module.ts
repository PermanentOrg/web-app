import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewsComponentsModule } from './views-components.module';
import { ViewsRoutingModule } from './views.routes';
import { Dialog, DialogChildComponentData, DialogModule } from '../dialog/dialog.module';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';

@NgModule({
  declarations: [
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    ViewsComponentsModule,
    ViewsRoutingModule,
    DialogModule
  ]
})
export class ViewsModule {
  private dialogComponents: DialogChildComponentData[] = [{
    token: 'TimelineViewComponent',
    component: TimelineViewComponent
  }];

  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    this.dialog.registerComponents(this.dialogComponents, resolver, true);
  }
}
