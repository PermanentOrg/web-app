import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { InViewportModule } from 'ng-in-viewport';

import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { VideoComponent } from '@shared/components/video/video.component';
import { SharingComponent } from '@fileBrowser/components/sharing/sharing.component';
import {
	FontAwesomeModule,
	FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faFileArchive } from '@fortawesome/free-solid-svg-icons';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { PublishComponent } from './components/publish/publish.component';
import { FolderDescriptionComponent } from './components/folder-description/folder-description.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FileListControlsComponent } from './components/file-list-controls/file-list-controls.component';
import { EditTagsComponent } from './components/edit-tags/edit-tags.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { SidebarViewOptionComponent } from './components/sidebar-view-option/sidebar-view-option.component';
import { SharingDialogComponent } from './components/sharing-dialog/sharing-dialog.component';

import { DownloadButtonComponent } from './components/download-button/download-button.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		SharedModule,
		GoogleMapsModule,
		InViewportModule,
		FontAwesomeModule,
	],
	exports: [
		FileListComponent,
		FileListItemComponent,
		FileViewerComponent,
		VideoComponent,
		SidebarComponent,
		FileListControlsComponent,
		EditTagsComponent,
		LocationPickerComponent,
		SharingDialogComponent,
	],
	declarations: [
		FileListComponent,
		FileListItemComponent,
		FileListControlsComponent,
		FileViewerComponent,
		FolderViewComponent,
		VideoComponent,
		SharingComponent,
		PublishComponent,
		FolderDescriptionComponent,
		SidebarComponent,
		EditTagsComponent,
		LocationPickerComponent,
		SidebarViewOptionComponent,
		SharingDialogComponent,
		DownloadButtonComponent,
	],
})
export class FileBrowserComponentsModule {
	constructor(
		resolver: ComponentFactoryResolver,
		private library: FaIconLibrary,
	) {
		library.addIcons(faFileArchive);
	}
}
