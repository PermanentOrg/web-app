import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharesComponent } from '@shares/components/shares/shares.component';
import { SharesResolveService } from '@shares/resolves/shares-resolve.service';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { ShareByMeComponent } from '@shares/components/share-by-me/share-by-me.component';
import { ShareWithMeComponent } from '@shares/components/share-with-me/share-with-me.component';

const sharesRootResolve = {
  shares: SharesResolveService
};

const shareRootChildren = [
  {
    path: 'record/:recArchiveNbr',
    component: FileViewerComponent,
    data: {
      singleFile: true
    },
    resolve: {
      currentRecord: RecordResolveService
    }
  }
];

export const routes: Routes = [
  {
    path: '',
    component: SharesComponent,
    resolve: sharesRootResolve,
    children: shareRootChildren
  },
  {
    path: ':shareArchiveNbr',
    component: SharesComponent,
    resolve: sharesRootResolve,
    children: shareRootChildren
  },
  {
    path: ':archiveNbr/:folderLinkId',
    loadChildren: () => import('../file-browser/file-browser.module').then(m => m.FileBrowserModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    SharesResolveService,
  ]
})
export class AppsRoutingModule { }

