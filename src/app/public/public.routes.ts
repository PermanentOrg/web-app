import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicItemComponent } from './components/public-item/public-item.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { PublicComponent } from './components/public/public.component';
import { PublishResolveService } from './resolves/publish-resolve.service';

const recordResolve = {
  currentRecord: RecordResolveService
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
        path: ':publishUrlToken',
        resolve: publishResolve,
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
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    PublishResolveService
  ]
})
export class PublicRoutingModule { }

