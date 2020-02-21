import { NgModule, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';
import { VideoComponent } from '@shared/components/video/video.component';
import { SharingComponent } from '@fileBrowser/components/sharing/sharing.component';
import { Dialog, DialogChildComponentData } from '../dialog/dialog.service';
import { DialogModule } from '../dialog/dialog.module';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { PublishComponent } from './components/publish/publish.component';
import { FolderDescriptionComponent } from './components/folder-description/folder-description.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DialogModule,
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
    FolderViewComponent,
    ThumbnailComponent,
    VideoComponent,
    SharingComponent,
    PublishComponent,
    FolderDescriptionComponent
  ],
  entryComponents: [
    SharingComponent,
    PublishComponent
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
    }
  ];

  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    this.dialog.registerComponents(this.dialogComponents, resolver, true);
  }
}
