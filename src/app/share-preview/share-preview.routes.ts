import { NgModule, ComponentFactoryResolver, Optional } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharePreviewComponent } from './components/share-preview/share-preview.component';
import { PreviewArchiveResolveService } from './resolves/preview-archive-resolve.service';
import { PreviewResolveService } from './resolves/preview-resolve.service';
import { SharedModule } from '@shared/shared.module';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { PreviewFolderResolveService } from './resolves/preview-folder-resolve.service';
import { ShareUrlResolveService } from './resolves/share-url-resolve.service';
import { ShareNotFoundComponent } from './components/share-not-found/share-not-found.component';
import { CreateAccountDialogComponent } from './components/create-account-dialog/create-account-dialog.component';
import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { InviteShareResolveService } from './resolves/invite-share-resolve.service';
import { RelationshipShareResolveService } from './resolves/relationship-share-resolve.service';
import { RoutedDialogWrapperComponent } from '@shared/components/routed-dialog-wrapper/routed-dialog-wrapper.component';
import { DialogChildComponentData } from '@root/app/dialog/dialog.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Dialog, DialogModule } from '../dialog/dialog.module';
import { LazyLoadFileBrowserSibling } from '@fileBrowser/file-browser.module';
import { AnnouncementModule } from '../announcement/announcement.module';

const archiveResolve = {
  archive: PreviewArchiveResolveService,
  currentFolder: PreviewFolderResolveService
};

const previewResolve = {
  currentFolder: PreviewResolveService
};

const shareResolve = {
  sharePreviewVO: ShareUrlResolveService
};

const shareInviteResolve = {
  sharePreviewVO: InviteShareResolveService
};

const shareRelationshipResolve = {
  sharePreviewVO: RelationshipShareResolveService
};

const sharePreviewChildren = [
  {
    path: '',
    resolve: previewResolve,
    component: SharePreviewComponent,
    data: {
      formDarkBg: true,
      showFolderDescription: true
    },
    children: [
      {
        path: '',
        data: {
          noFileListNavigation: true,
        },
        component: FileListComponent
      },
      {
        path: 'view',
        data: {
          sharePreviewView: true
        },
        loadChildren: LazyLoadFileBrowserSibling,
      }
    ]
  }
];
export const routes: Routes = [
  {
    path: 'error',
    component: ShareNotFoundComponent
  },
  {
    path: 'invite/:inviteCode',
    resolve: shareInviteResolve,
    data: {
      noFileListPadding: true
    },
    children: sharePreviewChildren
  },
  {
    path: 'view/:shareId/:folder_linkId',
    resolve: shareRelationshipResolve,
    data: {
      noFileListPadding: true
    },
    children: sharePreviewChildren
  },
  {
    path: ':shareToken',
    resolve: shareResolve,
    data: {
      noFileListPadding: true,
    },
    children: sharePreviewChildren
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule,
    FileBrowserComponentsModule,
    NgbModule,
    DialogModule,
    AnnouncementModule,
  ],
  declarations: [
    SharePreviewComponent,
    ShareNotFoundComponent,
    CreateAccountDialogComponent,
  ],
  providers: [
    PreviewResolveService,
    PreviewArchiveResolveService,
    PreviewFolderResolveService,
    ShareUrlResolveService,
    InviteShareResolveService,
    RelationshipShareResolveService
  ]
})
export class SharePreviewRoutingModule {
  private dialogComponents: DialogChildComponentData[] =[
    {
      token: 'CreateAccountDialogComponent',
      component: CreateAccountDialogComponent,
    },
  ]

  constructor(
    @Optional() private dialog?: Dialog,
    @Optional() private resolver?: ComponentFactoryResolver
  ) {
    this.dialog.registerComponents(
      this.dialogComponents,
      this.resolver,
      true
    );
  }
}
