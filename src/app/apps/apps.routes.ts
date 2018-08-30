import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConnectorsResolveService } from '@apps/resolves/connectors-resolve.service';
import { AppsGuard } from '@core/guards/apps.guard';

import { AppsComponent } from '@apps/components/apps/apps.component';
import { AppsFolderResolveService } from '@apps/resolves/apps-folder-resolve.service';


const appsRootResolve = {
  appsFolder: AppsFolderResolveService,
  connectors: ConnectorsResolveService
};

export const routes: Routes = [
  {
    path: '',
    component: AppsComponent,
    resolve: appsRootResolve,
  },
  {
    path: ':archiveNbr/:folderLinkId',
    loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
    canActivate: [ AppsGuard ],
    canActivateChild: [ AppsGuard ],
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    AppsFolderResolveService,
    ConnectorsResolveService
  ]
})
export class AppsRoutingModule { }

