import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { AppsRoutingModule } from '@apps/apps-routing.module';
import { AppsComponent } from '@apps/components/apps/apps.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AppsRoutingModule,
    FileBrowserModule
  ],
  declarations: [
    AppsComponent
  ],
  providers: [
  ]
})
export class AppsModule { }
