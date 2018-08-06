import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '@core/components/home/home.component';
import { MainComponent } from '@core/components/main/main.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';

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
      { path: '', component: HomeComponent},
      { path: 'myfiles', loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule'},
      { path: 'apps', loadChildren: '@apps/apps.module#AppsModule' },
      { path: '**', redirectTo: ''}
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
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

