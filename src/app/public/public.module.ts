import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public.routes';
import { RouterModule } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { PublicItemComponent } from './components/public-item/public-item.component';
import { SharedModule } from '@shared/shared.module';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';
import { PublicComponent } from './components/public/public.component';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { PublicArchiveComponent } from './components/public-archive/public-archive.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { EditService } from '@core/services/edit/edit.service';

@NgModule({
  declarations: [
    PublicItemComponent,
    PublicComponent,
    ItemNotFoundComponent,
    SearchComponent,
    PublicArchiveComponent,
    SearchBoxComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule,
    SharedModule,
    FileBrowserModule
  ],
  providers: [
    DataService,
    FolderViewService,
    PromptService,
    FolderPickerService,
    EditService
  ]
})
export class PublicModule {
  constructor(folderView: FolderViewService) {
    folderView.setFolderView(FolderView.Grid, true);
  }
}
