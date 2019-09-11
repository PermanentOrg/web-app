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

const archiveResolve = {
  archive: PreviewArchiveResolveService,
  currentFolder: PreviewFolderResolveService
};

const previewResolve = {
  previewItem: PreviewResolveService
};

const shareResolve = {
  shareByUrlVO: ShareUrlResolveService
};


export const routes: Routes = [
  {
    path: ':shareToken',
    resolve: shareResolve,
    data: {
      noFileListPadding: true,
      noFileListNavigation: true
    },
    children: [
      {
        path: '',
        // resolve: archiveResolve,
        component: SharePreviewComponent,
        data: {
          formDarkBg: true
        },
        // children: [
        //   {
        //     path: '',
        //   },
        //   {
        //     path: 'action',
        //     loadChildren: '@embed/embed.module#EmbedModule'
        //   }
        // ]
      }
    ]
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
    SharePreviewComponent
  ],
  providers: [
    PreviewResolveService,
    PreviewArchiveResolveService,
    PreviewFolderResolveService,
    ShareUrlResolveService
  ]
})
export class SharePreviewRoutingModule { }

