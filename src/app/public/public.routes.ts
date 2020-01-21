import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicItemComponent } from './components/public-item/public-item.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { PublicComponent } from './components/public/public.component';
import { PublishResolveService } from './resolves/publish-resolve.service';
import { PublishArchiveResolveService } from './resolves/publish-archive-resolve.service';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { TimelineViewComponent } from '../views/components/timeline-view/timeline-view.component';

const archiveResolve = {
  archive: PublishArchiveResolveService
};

const publishResolve = {
  publishedItem: PublishResolveService
};

export const routes: Routes = [
  {
    path: 'timeline',
    component: TimelineViewComponent
  },
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
    PublishArchiveResolveService
  ]
})
export class PublicRoutingModule { }

