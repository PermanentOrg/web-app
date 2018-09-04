import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '@core/components/home/home.component';
import { MainComponent } from '@core/components/main/main.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { SharedModule } from '@shared/shared.module';
import { ArchiveSelectorComponent } from '@core/components/archive-selector/archive-selector.component';
import { ArchivesResolveService } from '@core/resolves/archives-resolve.service';

const rootFolderResolve = {
  rootFolder: RootFolderResolveService
};

export const routes: Routes = [
  { path: '',
    component: MainComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    resolve: rootFolderResolve,
    children: [
      { path: '', component: HomeComponent, data: { title: 'Home'} },
      { path: 'myfiles', loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule', data: { title: 'My Files'} },
      { path: 'apps', loadChildren: '@apps/apps.module#AppsModule', data: { title: 'Apps'} },
      {
        path: 'choosearchive',
        component: ArchiveSelectorComponent,
        data: { title: 'Choose Archive'},
        resolve: { archives: ArchivesResolveService }
      },
      { path: '**', redirectTo: ''}
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    FolderResolveService,
    RootFolderResolveService,
    RecordResolveService,
    ArchivesResolveService
  ],
  declarations: []
})
export class CoreRoutingModule { }

