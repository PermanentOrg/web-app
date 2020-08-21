import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MainComponent } from '@core/components/main/main.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { ArchivesResolveService } from '@core/resolves/archives-resolve.service';
import { DonateResolveService} from '@core/resolves/donate-resolve.service';
import { RelationshipsResolveService } from './resolves/relationships-resolve.service';

import { SharedModule } from '@shared/shared.module';
import { ArchiveSwitcherComponent } from '@core/components/archive-switcher/archive-switcher.component';
import { DonateComponent } from './components/donate/donate.component';
import { InvitationsComponent } from './components/invitations/invitations.component';
import { MembersComponent } from './components/members/members.component';
import { MembersResolveService } from './resolves/members-resolve.service';
import { RoutesWithData } from '../app.routes';
import { AccountResolveService } from './resolves/account-resolve.service';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileItemsResolveService } from './resolves/profile-items-resolve.service';
import { GlobalSearchResultsComponent } from '@search/components/global-search-results/global-search-results.component';
import { TagsResolveService } from './resolves/tags.resolve.service';
import { AllArchivesComponent } from './components/all-archives/all-archives.component';
import { LoadingArchiveComponent } from './components/loading-archive/loading-archive.component';
import { RoutedDialogWrapperComponent } from '@shared/components/routed-dialog-wrapper/routed-dialog-wrapper.component';

const rootFolderResolve = {
  rootFolder: RootFolderResolveService
};

export const routes: RoutesWithData = [
  { path: 'm',
    component: MainComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    resolve: rootFolderResolve,
    children: [
      {
        path: 'myfiles',
        loadChildren: () => import('../file-browser/file-browser.module').then(m => m.FileBrowserModule),
        data: { title: 'My Files', showSidebar: true, showFolderViewToggle: true }
      },
      {
        path: 'public',
        loadChildren: () => import('../file-browser/file-browser.module').then(m => m.FileBrowserModule),
        data: { title: 'Public', showSidebar: true, showFolderViewToggle: true }
      },
      {
        path: 'apps',
        loadChildren: () => import('../apps/apps.module').then(m => m.AppsModule),
        data: { title: 'Apps', showSidebar: true }
      },
      {
        path: 'profile',
        component: ProfileEditComponent,
        data: { title: 'Profile'},
        resolve: { profileItems: ProfileItemsResolveService }
      },
      {
        path: 'shares',
        loadChildren: () => import('../shares/shares.module').then(m => m.SharesModule),
        data: { title: 'Shares', showSidebar: true }
      },
      {
        path: 'choosearchive',
        component: ArchiveSwitcherComponent,
        data: { title: 'Choose Archive'},
        resolve: { archives: ArchivesResolveService }
      },
      {
        path: 'archives',
        component: AllArchivesComponent,
        data: { title: 'Archives'},
        resolve: { archives: ArchivesResolveService }
      },
      {
        path: 'donate',
        component: DonateComponent,
        data: { title: 'Add Storage'},
        resolve: { cards: DonateResolveService }
      },
      {
        path: 'invitations',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Invitations',
          dialogToken: 'InvitationsDialogComponent',
          dialogOptions: { width: '1000px'}
        }
      },
      {
        path: 'invitations',
        redirectTo: '/m/(myfiles//dialog:invitations)'
      },
      {
        path: 'archive/sentInvites',
        redirectTo: '/m/(myfiles//dialog:invitations)'
      },
      {
        path: 'connections',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Connections',
          dialogToken: 'ConnectionsDialogComponent',
          dialogOptions: { width: '1000px'}
        },
        resolve: { connections: RelationshipsResolveService }
      },
      {
        path: 'connections',
        redirectTo: '/m/(myfiles//dialog:connections)'
      },
      {
        path: 'relationships',
        redirectTo: '/m/(myfiles//dialog:connections)'
      },
      {
        path: 'archive/relationships',
        redirectTo: '/m/(myfiles//dialog:connections)'
      },
      {
        path: 'relationship_request/:email',
        redirectTo: '/m/(myfiles//dialog:connections)'
      },
      {
        path: 'profile',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Archive Profile',
          dialogToken: 'ProfileEditComponent',
          dialogOptions: { width: '100%', height: 'fullscreen', menuClass: 'profile-editor-dialog'}
        },
        resolve: { profileItems: ProfileItemsResolveService }
      },
      {
        path: 'profile',
        redirectTo: '/m/(myfiles//dialog:profile)'
      },
      {
        path: 'account',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Account',
          dialogToken: 'SettingsDialogComponent',
          dialogOptions: { width: '1000px'}
        }
      },
      {
        path: 'account',
        redirectTo: '/m/(myfiles//dialog:account)'
      },
      {
        path: 'members',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Archive Members',
          dialogToken: 'MembersDialogComponent',
          dialogOptions:  { width: '1000px'}
        },
        resolve: { members: MembersResolveService }
      },
      {
        path: 'members',
        redirectTo: '/m/(myfiles//dialog:members)'
      },
      {
        path: 'archive/members',
        redirectTo: '/m/(myfiles//dialog:members)'
      },
      {
        path: 'search',
        component: GlobalSearchResultsComponent,
        data: { title: 'Search' },
        resolve: { loadTags: TagsResolveService }
      },
      {
        path: 'switching',
        component: LoadingArchiveComponent
      },
      { path: '**', redirectTo: 'myfiles'}
    ]
  },
  { path: 'app', redirectTo: 'm', pathMatch: 'full'},
  { path: '', redirectTo: 'm', pathMatch: 'full'},
  { path: ':path', redirectTo: 'm/:path'},
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
    DonateResolveService,
    RelationshipsResolveService,
    MembersResolveService,
    AccountResolveService,
    ProfileItemsResolveService,
    TagsResolveService
  ],
  declarations: []
})
export class CoreRoutingModule { }

