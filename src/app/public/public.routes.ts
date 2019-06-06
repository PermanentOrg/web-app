import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestComponent } from './components/test/test.component';
import { PublicItemComponent } from './components/public-item/public-item.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { PublicComponent } from './components/public/public.component';

const recordResolve = {
  currentRecord: RecordResolveService
};

export const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'record/:recArchiveNbr',
        resolve: recordResolve,
        component: PublicItemComponent,
        data: {
          isRecord: true
        }
      },
      {
        path: ':archiveNbr/:folderLinkId',
        loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
        data: {
          noFileListPadding: true
        }
      }
    ]
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    // RecordResolveService
  ]
})
export class PublicRoutingModule { }

