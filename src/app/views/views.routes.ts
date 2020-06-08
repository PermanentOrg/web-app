import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { LeanFolderResolveService } from '@core/resolves/lean-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { fileListChildRoutes } from '@fileBrowser/file-browser.routes';
import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FolderResolveService } from '@core/resolves/folder-resolve.service';

const folderResolve = {
  currentFolder: FolderResolveService
};

const leanFolderResolve = {
  currentFolder: LeanFolderResolveService
};

const recordResolve = {
  currentRecord: RecordResolveService
};

export const routes: Routes = [
  {
    path: 'timeline',
    data: {
      folderView: 'folder.view.timeline',
      containerVerticalFlex: true,
      hideBreadcrumbs: true
    },
    children: [{
      path: ':archiveNbr/:folderLinkId',
      component: TimelineViewComponent,
      resolve: leanFolderResolve,
      children: fileListChildRoutes
    }],
  },
  {
    path: 'grid',
    data: {
      folderView: 'folder.view.grid',
      containerVerticalFlex: false,
      hideBreadcrumbs: false
    },
    children: [{
      path: ':archiveNbr/:folderLinkId',
      component: FileListComponent,
      resolve: folderResolve,
      children: fileListChildRoutes
    }],
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    FileBrowserComponentsModule
  ],
  exports: [
  ],
  providers: [
    LeanFolderResolveService,
    RecordResolveService,
    FolderResolveService
  ],
  declarations: []
})
export class ViewsRoutingModule { }

