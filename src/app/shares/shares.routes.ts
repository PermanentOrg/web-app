import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharesComponent } from '@shares/components/shares/shares.component';
import { SharesResolveService } from '@shares/resolves/shares-resolve.service';

const sharesRootResolve = {
  shares: SharesResolveService
};

export const routes: Routes = [
  {
    path: '',
    component: SharesComponent,
    resolve: sharesRootResolve,
  },
  {
    path: ':archiveNbr',
    component: SharesComponent,
    resolve: sharesRootResolve,
  },
  {
    path: ':archiveNbr/:folderLinkId',
    loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    SharesResolveService,
  ]
})
export class AppsRoutingModule { }

