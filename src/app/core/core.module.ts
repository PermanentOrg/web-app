import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreRoutingModule } from '@core/core-routing.module';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { DataService } from '@shared/services/data/data.service';

import { HomeComponent } from '@core/components/home/home.component';
import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { BreadcrumbsComponent } from '@core/components/breadcrumbs/breadcrumbs.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CoreRoutingModule,
  ],
  declarations: [
    HomeComponent,
    MainComponent,
    NavComponent,
    LeftMenuComponent,
    BreadcrumbsComponent,
  ],
  providers: [
    DataService
  ]
})
export class CoreModule { }
