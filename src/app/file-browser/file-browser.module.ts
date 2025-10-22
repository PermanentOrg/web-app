import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FileBrowserRoutingModule } from '@fileBrowser/file-browser.routes';
import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { VideoComponent } from '@shared/components/video/video.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
		VideoComponent,
	],
})
export class FileBrowserModule {}
