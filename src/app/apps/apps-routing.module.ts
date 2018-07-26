import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { AppsFolderResolveService } from '@apps/resolves/apps-folder-resolve.service';

import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { AppsComponent } from '@apps/components/apps/apps.component';



const appsFolderResolve = {
  appsFolder: FolderResolveService,
};

export const routes: Routes = [
  {
    path: '',
    component: AppsComponent,
    resolve: appsFolderResolve,
  },
  { path: ':archiveNbr/:folderLinkId', loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule' },
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

