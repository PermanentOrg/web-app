/* @format */
import { NgModule, ComponentFactoryResolver, Optional } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LazyLoadFileBrowserSibling } from '@fileBrowser/lazy-load-file-browser-sibling';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { AnnouncementModule } from '../announcement/announcement.module';
import { SharePreviewComponent } from './components/share-preview/share-preview.component';
import { PreviewArchiveResolveService } from './resolves/preview-archive-resolve.service';
import { PreviewResolveService } from './resolves/preview-resolve.service';
import { PreviewFolderResolveService } from './resolves/preview-folder-resolve.service';
import { ShareUrlResolveService } from './resolves/share-url-resolve.service';
import { ShareNotFoundComponent } from './components/share-not-found/share-not-found.component';
import { CreateAccountDialogComponent } from './components/create-account-dialog/create-account-dialog.component';
import { InviteShareResolveService } from './resolves/invite-share-resolve.service';
import { RelationshipShareResolveService } from './resolves/relationship-share-resolve.service';

import { SharePreviewFooterComponent } from './components/share-preview-footer/share-preview-footer.component';

const archiveResolve = {
  archive: PreviewArchiveResolveService,
  currentFolder: PreviewFolderResolveService,
};

const previewResolve = {
  currentFolder: PreviewResolveService,
};

const shareResolve = {
  sharePreviewVO: ShareUrlResolveService,
};

const shareInviteResolve = {
  sharePreviewVO: InviteShareResolveService,
};

const shareRelationshipResolve = {
  sharePreviewVO: RelationshipShareResolveService,
};

const sharePreviewChildren = [
  {
    path: '',
    resolve: previewResolve,
    component: SharePreviewComponent,
    data: {
      formDarkBg: true,
      showFolderDescription: true,
    },
    children: [
      {
        path: '',
        data: {
          noFileListNavigation: true,
        },
        component: FileListComponent,
      },
      {
        path: 'view',
        data: {
          sharePreviewView: true,
        },
        loadChildren: LazyLoadFileBrowserSibling,
      },
    ],
  },
];
export const routes: Routes = [
  {
    path: 'error',
    component: ShareNotFoundComponent,
  },
  {
    path: 'invite/:inviteCode',
    resolve: shareInviteResolve,
    data: {
      noFileListPadding: true,
    },
    children: sharePreviewChildren,
  },
  {
    path: 'view/:shareId/:folder_linkId',
    resolve: shareRelationshipResolve,
    data: {
      noFileListPadding: true,
    },
    children: sharePreviewChildren,
  },
  {
    path: '',
    resolve: shareResolve,
    data: {
      noFileListPadding: true,
    },
    children: sharePreviewChildren,
  },
  {
    path: ':shareToken',
    resolve: shareResolve,
    data: {
      noFileListPadding: true,
    },
    children: [
      ...sharePreviewChildren,
      {
        path: 'record/:recArchiveNbr',
        component: FileViewerComponent,
        resolve: {
          currentRecord: RecordResolveService,
        },
      },
    ],
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule,
    FileBrowserComponentsModule,
    NgbModule,
    AnnouncementModule,
  ],
  declarations: [
    SharePreviewComponent,
    ShareNotFoundComponent,
    CreateAccountDialogComponent,
    SharePreviewFooterComponent,
  ],
  providers: [
    PreviewResolveService,
    PreviewArchiveResolveService,
    PreviewFolderResolveService,
    ShareUrlResolveService,
    InviteShareResolveService,
    RelationshipShareResolveService,
  ],
})
export class SharePreviewRoutingModule {}
