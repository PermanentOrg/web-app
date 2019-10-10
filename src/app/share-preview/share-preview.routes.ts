import { NgModule } from '@angular/core';
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
import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { InviteShareResolveService } from './resolves/invite-share-resolve.service';

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

const sharePreviewChildren = [
  {
    path: '',
    resolve: previewResolve,
    component: SharePreviewComponent,
    data: {
      formDarkBg: true
    },
    children: [
      {
        path: '',
        data: {
          noFileListNavigation: true
        },
        component: FileListComponent
      },
      {
        path: 'view',
        loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
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
    FileBrowserComponentsModule
  ],
  declarations: [
    SharePreviewComponent,
    ShareNotFoundComponent
  ],
  providers: [
    PreviewResolveService,
    PreviewArchiveResolveService,
    PreviewFolderResolveService,
    ShareUrlResolveService,
    InviteShareResolveService
  ]
})
export class SharePreviewRoutingModule { }

