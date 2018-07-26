import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';

import { AppsRoutingModule } from '@apps/apps-routing.module';
import { AppsComponent } from '@apps/components/apps/apps.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AppsRoutingModule,
    CoreModule
  ],
  declarations: [
    AppsComponent
  ],
  providers: [
  ]
})
export class AppsModule { }
