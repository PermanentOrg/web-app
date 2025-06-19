import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { RecordResolveV2Service } from '@core/resolves/record-resolve-v2.service';
import { FileViewerV2Component } from './components/file-viewer-v2/file-viewer-v2.component';

const folderResolve = {
  currentFolder: FolderResolveService,
};

const recordResolve = {
  currentRecord: RecordResolveService,
};

const recordResolveV2 = {
  currentRecord: RecordResolveV2Service,
};

export const fileListChildRoutes = [
  {
    path: 'record/:recArchiveNbr',
    component: FileViewerComponent,
    resolve: recordResolve,
  },
  {
    path: 'record/v2/:recArchiveNbr',
    component: FileViewerV2Component,
    resolve: recordResolveV2,
  },
];

export const routes: Routes = [
  {
    path: '',
    component: FileListComponent,
    resolve: folderResolve,
    children: fileListChildRoutes,
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'view',
    loadChildren: () =>
      import('../views/views.module').then((m) => m.ViewsModule),
  },
  {
    path: ':archiveNbr/:folderLinkId',
    component: FileListComponent,
    resolve: folderResolve,
    children: fileListChildRoutes,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  providers: [FolderResolveService, RecordResolveService],
  declarations: [],
})
export class FileBrowserRoutingModule {}
