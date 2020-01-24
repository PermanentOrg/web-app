import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicItemComponent } from './components/public-item/public-item.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { PublicComponent } from './components/public/public.component';
import { PublishResolveService } from './resolves/publish-resolve.service';
import { PublishArchiveResolveService } from './resolves/publish-archive-resolve.service';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { PublicArchiveComponent } from './components/public-archive/public-archive.component';
import { PublicArchiveResolveService } from './resolves/public-archive-resolve.service';
import { PublicRootResolveService } from './resolves/public-root-resolve.service';
import { FolderResolveService } from '@core/resolves/folder-resolve.service';

const archiveResolve = {
  archive: PublishArchiveResolveService
};

const publicArchiveResolve = {
  archive: PublicArchiveResolveService,
  publicRoot: PublicRootResolveService
};

const publishResolve = {
  publishedItem: PublishResolveService
};

export const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    data: {
      isPublic: true
    },
    children: [
      {
        path: 'error',
        component: ItemNotFoundComponent
      },
      {
        path: 'search',
        component: SearchComponent
      },
      {
        path: 'archive/:publicArchiveNbr',
        component: PublicArchiveComponent,
        resolve: publicArchiveResolve,
        loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
        data: {
          noFileListPadding: true,
          isPublicArchive: true
        },
      },
      {
        path: ':publishUrlToken',
        resolve: publishResolve,
        children: [
          {
            path: '',
            resolve: archiveResolve,
            children: [
              {
                path: '',
                component: PublicItemComponent
              },
              {
                path: ':archiveNbr/:folderLinkId',
                loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
                data: {
                  noFileListPadding: true,
                }
              }
            ]
          }
        ]
      }
    ]
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    PublishResolveService,
    PublishArchiveResolveService,
    PublicArchiveResolveService,
    PublicRootResolveService
  ]
})
export class PublicRoutingModule { }

