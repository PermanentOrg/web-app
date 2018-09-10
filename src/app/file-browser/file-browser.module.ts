import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FileBrowserRoutingModule } from '@fileBrowser/file-browser.routes';
import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';
import { VideoComponent } from '@shared/components/video/video.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FileBrowserRoutingModule,
    SharedModule
  ],
  exports: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent,
    ThumbnailComponent,
    VideoComponent
  ],
  declarations: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent,
    ThumbnailComponent,
    VideoComponent
  ]
})
export class FileBrowserModule { }
