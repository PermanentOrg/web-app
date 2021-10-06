import { NgModule, Optional, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public.routes';
import { RouterModule } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { } from '@core/services/folder-picker/folder-picker.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';
import { PublicComponent } from './components/public/public.component';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { PublicArchiveComponent } from './components/public-archive/public-archive.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { PublicProfileService } from './services/public-profile/public-profile.service';
import { DialogModule } from '../dialog/dialog.module';

@NgModule({
  declarations: [
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
    DialogModule,
    CoreModule,
  ],
  providers: [
    DataService,
    FolderViewService,
    PublicProfileService
  ]
})
export class PublicModule {
  constructor(
    folderView: FolderViewService,
    ) {
    folderView.setFolderView(FolderView.Grid, true);
  }
}
