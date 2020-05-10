import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';

const folderResolve = {
  currentFolder: FolderResolveService
};

const recordResolve = {
  currentRecord: RecordResolveService
};

const fileListChildRoutes = [
  {
    path: 'record/:recArchiveNbr',
    component: FileViewerComponent,
    resolve: recordResolve
  }
];

export const routes: Routes = [
  {
    path: '',
    component: FileListComponent,
    resolve: folderResolve,
    children: fileListChildRoutes
  },
  {
    path: ':archiveNbr/:folderLinkId',
    component: FileListComponent,
    resolve: folderResolve,
    children: fileListChildRoutes
  },
  {
    path: 'view',
    loadChildren: () => import('../views/views.module').then(m => m.ViewsModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
  ],
  providers: [
    FolderResolveService,
    RecordResolveService
  ],
  declarations: []
})
export class FileBrowserRoutingModule { }

