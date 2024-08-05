import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { AppsRoutingModule } from '@apps/apps.routes';
import { AppsComponent } from '@apps/components/apps/apps.component';
import { ConnectorComponent } from '@apps/components/connector/connector.component';
import { FamilySearchImportComponent } from '@apps/components/family-search-import/family-search-import.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AppsRoutingModule,
    FileBrowserModule,
  ],
  declarations: [
    AppsComponent,
    ConnectorComponent,
    FamilySearchImportComponent,
  ],
  providers: [],
})
export class AppsModule {}
