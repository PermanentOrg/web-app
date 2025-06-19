/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  RouterModule,
} from '@angular/router';

import { FileBrowserRoutingModule } from '@fileBrowser/file-browser.routes';
import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { VideoComponent } from '@shared/components/video/video.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FileViewerV2Component } from './components/file-viewer-v2/file-viewer-v2.component';
import { FileBrowserComponentsModule } from './file-browser-components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FileBrowserComponentsModule,
    FileBrowserRoutingModule,
    SharedModule,
    NgbTooltipModule,
  ],
  exports: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent,
    FileViewerV2Component,
    VideoComponent,
  ],
})
export class FileBrowserModule {}
