import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from '@core/components/main/main.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { ArchivesResolveService } from '@core/resolves/archives-resolve.service';
import { DonateResolveService} from '@core/resolves/donate-resolve.service';

import { SharedModule } from '@shared/shared.module';
import { ArchiveSelectorComponent } from '@core/components/archive-selector/archive-selector.component';
import { DonateComponent } from './components/donate/donate.component';

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
      { path: 'myfiles', loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule', data: { title: 'My Files'} },
      { path: 'apps', loadChildren: '@apps/apps.module#AppsModule', data: { title: 'Apps'} },
      { path: 'shares', loadChildren: '@shares/shares.module#SharesModule', data: { title: 'Shares'} },
      {
        path: 'choosearchive',
        component: ArchiveSelectorComponent,
        data: { title: 'Choose Archive'},
        resolve: { archives: ArchivesResolveService }
      },
      {
        path: 'donate',
        component: DonateComponent,
        data: { title: 'Add Storage'},
        resolve: { cards: DonateResolveService }
      },
      { path: '**', redirectTo: 'myfiles'}
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
    ArchivesResolveService,
    DonateResolveService
  ],
  declarations: []
})
export class CoreRoutingModule { }

