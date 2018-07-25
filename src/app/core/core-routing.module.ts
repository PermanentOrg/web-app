import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '@core/components/home/home.component';
import { MainComponent } from '@core/components/main/main.component';
import { FileListComponent } from '@core/components/file-list/file-list.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { FileViewerComponent } from '@core/components/file-viewer/file-viewer.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';

const rootFolderResolve = {
  rootFolder: RootFolderResolveService
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
    component: MainComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    resolve: rootFolderResolve,
    children: [
      { path: '', component: HomeComponent},
      { path: 'myfiles', component: FileListComponent, resolve: folderResolve, children: fileListChildRoutes},
      { path: 'myfiles/:archiveNbr/:folderLinkId', component: FileListComponent, resolve: folderResolve, children: fileListChildRoutes},
      { path: '**', redirectTo: ''}
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    FolderResolveService,
    RootFolderResolveService,
    RecordResolveService
  ],
  declarations: []
})
export class CoreRoutingModule { }

