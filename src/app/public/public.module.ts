import { NgModule, Optional, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public.routes';
import { RouterModule } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { } from '@core/services/folder-picker/folder-picker.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { PublicItemComponent } from './components/public-item/public-item.component';
import { SharedModule } from '@shared/shared.module';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';
import { PublicComponent } from './components/public/public.component';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { PublicArchiveComponent } from './components/public-archive/public-archive.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { BrowserModule } from '@angular/platform-browser';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { Dialog, DialogChildComponentData, DialogModule } from '../dialog/dialog.module';

@NgModule({
  declarations: [
    PublicItemComponent,
    PublicComponent,
    ItemNotFoundComponent,
    SearchComponent,
    PublicArchiveComponent,
    SearchBoxComponent,
    PublicProfileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule,
    SharedModule,
    FileBrowserModule,
    DialogModule
  ],
  providers: [
    DataService,
    FolderViewService
  ]
})
export class PublicModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'PublicProfileComponent',
      component: PublicProfileComponent
    },
  ];

  constructor(
    folderView: FolderViewService,
    @Optional() private dialog?: Dialog,
    @Optional() private resolver?: ComponentFactoryResolver,
    ) {
    folderView.setFolderView(FolderView.Grid, true);

    if (this.dialog) {
      this.dialog.registerComponents(this.dialogComponents, this.resolver, true);
    }
  }
}
