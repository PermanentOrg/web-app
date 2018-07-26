import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { AppsRoutingModule } from '@apps/apps-routing.module';
import { AppsComponent } from '@apps/components/apps/apps.component';
import { ConnectorComponent } from '@apps/components/connector/connector.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AppsRoutingModule,
    FileBrowserModule
  ],
  declarations: [
    AppsComponent,
    ConnectorComponent,
  ],
  providers: [
  ]
})
export class AppsModule { }
