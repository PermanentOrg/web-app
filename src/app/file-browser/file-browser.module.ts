import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FileBrowserRoutingModule } from '@fileBrowser/file-browser-routing.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';

import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FileBrowserRoutingModule
  ],
  exports: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent
  ],
  declarations: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent,
    ThumbnailComponent,
    BgImageSrcDirective
  ]
})
export class FileBrowserModule { }
