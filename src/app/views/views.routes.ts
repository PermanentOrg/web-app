import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { LeanFolderResolveService } from '@core/resolves/lean-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';

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
      hideBreadcrumbs: true
    },
    children: [{
      path: ':archiveNbr/:folderLinkId',
      component: TimelineViewComponent,
      resolve: leanFolderResolve,
      children: [{
        path: 'record/:recArchiveNbr',
        component: FileViewerComponent,
        resolve: recordResolve
      }]
    }]
  },
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
    RecordResolveService
  ],
  declarations: []
})
export class ViewsRoutingModule { }

