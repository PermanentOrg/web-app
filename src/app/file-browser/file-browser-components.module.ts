import { NgModule, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { VideoComponent } from '@shared/components/video/video.component';
import { SharingComponent } from '@fileBrowser/components/sharing/sharing.component';
import { Dialog, DialogChildComponentData } from '../dialog/dialog.service';
import { DialogModule } from '../dialog/dialog.module';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { PublishComponent } from './components/publish/publish.component';
import { FolderDescriptionComponent } from './components/folder-description/folder-description.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FileListControlsComponent } from './components/file-list-controls/file-list-controls.component';
import { EditTagsComponent } from './components/edit-tags/edit-tags.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { SidebarViewOptionComponent } from './components/sidebar-view-option/sidebar-view-option.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DialogModule,
    GoogleMapsModule
  ],
  exports: [
    FileListComponent,
    FileListItemComponent,
    FileViewerComponent,
    VideoComponent,
    SidebarComponent,
    FileListControlsComponent,
    EditTagsComponent,
    LocationPickerComponent
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
    SidebarViewOptionComponent
  ],
  entryComponents: [
    SharingComponent,
    PublishComponent,
    EditTagsComponent,
    LocationPickerComponent
  ]
})
export class FileBrowserComponentsModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'SharingComponent',
      component: SharingComponent
    },
    {
      token: 'PublishComponent',
      component: PublishComponent
    },
    {
      token: 'EditTagsComponent',
      component: EditTagsComponent
    },
    {
      token: 'LocationPickerComponent',
      component: LocationPickerComponent
    }
  ];

  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    this.dialog.registerComponents(this.dialogComponents, resolver, true);
  }
}
