import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { AppsFolderResolveService } from '@apps/resolves/apps-folder-resolve.service';

import { FileListComponent } from '@core/components/file-list/file-list.component';
import { FileViewerComponent } from '@core/components/file-viewer/file-viewer.component';
import { AppsComponent } from '@apps/components/apps/apps.component';



const appsFolderResolve = {
  appsFolder: FolderResolveService,
};

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
  { path: '',
    component: AppsComponent,
    resolve: appsFolderResolve,
    children: [
      { path: ':archiveNbr/:folderLinkId', component: FileListComponent, resolve: folderResolve, children: fileListChildRoutes},
      { path: '**', redirectTo: ''}
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    AppsFolderResolveService,
    FolderResolveService,
    RecordResolveService
  ],
  declarations: []
})
export class AppsRoutingModule { }

