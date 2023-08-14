import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { AppsRoutingModule } from '@apps/apps.routes';
import { AppsComponent } from '@apps/components/apps/apps.component';
import { ConnectorComponent } from '@apps/components/connector/connector.component';
import { FamilySearchImportComponent } from '@apps/components/family-search-import/family-search-import.component';
import { SharedModule } from '@shared/shared.module';
import { DialogChildComponentData, Dialog } from '../dialog/dialog.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AppsRoutingModule,
    FileBrowserModule
  ],
  declarations: [
    AppsComponent,
    ConnectorComponent,
    FamilySearchImportComponent
  ],
  providers: [
  ]
})
export class AppsModule {
  private dialogComponents: DialogChildComponentData[] = [{
    token: 'FamilySearchImportComponent',
    component: FamilySearchImportComponent
  }];

  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    this.dialog.registerComponents(this.dialogComponents, resolver, true);
  }
}
