/* @format */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MainComponent } from '@core/components/main/main.component';

import { AuthGuard } from '@core/guards/auth.guard';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { ArchivesResolveService } from '@core/resolves/archives-resolve.service';
import { RelationshipsResolveService } from './resolves/relationships-resolve.service';

import { SharedModule } from '@shared/shared.module';
import { ArchiveSwitcherComponent } from '@core/components/archive-switcher/archive-switcher.component';
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
  rootFolder: RootFolderResolveService,
};

export const routes: RoutesWithData = [
  {
    path: 'app',
    component: MainComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    resolve: rootFolderResolve,
    children: [
      {
        path: 'myfiles',
        loadChildren: () =>
          import('../file-browser/file-browser.module').then(
            (m) => m.FileBrowserModule
          ),
        data: {
          title: 'My Files',
          showSidebar: true,
          showFolderViewToggle: true,
        },
      },
      {
        path: 'public',
        loadChildren: () =>
          import('../file-browser/file-browser.module').then(
            (m) => m.FileBrowserModule
          ),
        data: {
          title: 'Public',
          showSidebar: true,
          showFolderViewToggle: true,
        },
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('../apps/apps.module').then((m) => m.AppsModule),
        data: { title: 'Apps', showSidebar: true },
      },
      {
        path: 'profile',
        component: ProfileEditComponent,
        data: { title: 'Profile' },
        resolve: { profileItems: ProfileItemsResolveService },
      },
      {
        path: 'shares',
        loadChildren: () =>
          import('../shares/shares.module').then((m) => m.SharesModule),
        data: { title: 'Shares', showSidebar: true },
      },
      {
        path: 'choosearchive',
        component: ArchiveSwitcherComponent,
        data: { title: 'Choose Archive' },
        resolve: { archives: ArchivesResolveService },
      },
      {
        path: 'archives',
        component: AllArchivesComponent,
        data: { title: 'Archives' },
        resolve: { archives: ArchivesResolveService },
      },
      {
        path: 'donate',
        redirectTo: '/app/(myfiles//dialog:storage)',
      },
      {
        path: 'invitations',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Invitations',
          dialogToken: 'InvitationsDialogComponent',
          dialogOptions: { width: '1000px' },
        },
      },
      {
        path: 'invitations',
        redirectTo: '/app/(myfiles//dialog:invitations)',
      },
      {
        path: 'archive/sentInvites',
        redirectTo: '/app/(myfiles//dialog:invitations)',
      },
      {
        path: 'connections',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Connections',
          dialogToken: 'ConnectionsDialogComponent',
          dialogOptions: { width: '1000px' },
        },
        resolve: { connections: RelationshipsResolveService },
      },
      {
        path: 'connections',
        redirectTo: '/app/(myfiles//dialog:connections)',
      },
      {
        path: 'relationships',
        redirectTo: '/app/(myfiles//dialog:connections)',
      },
      {
        path: 'archive/relationships',
        redirectTo: '/app/(myfiles//dialog:connections)',
      },
      {
        path: 'relationship_request/:email',
        redirectTo: '/app/(myfiles//dialog:connections)',
      },
      {
        path: 'profile',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Archive Profile',
          dialogToken: 'ProfileEditComponent',
          dialogOptions: {
            width: '100%',
            height: 'fullscreen',
            menuClass: 'profile-editor-dialog',
          },
        },
        resolve: { profileItems: ProfileItemsResolveService },
      },
      {
        path: 'profile',
        redirectTo: '/app/(myfiles//dialog:profile)',
      },
      {
        path: 'account',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Account',
          dialogToken: 'SettingsDialogComponent',
          dialogOptions: { width: '1000px' },
        },
      },
      {
        path: 'account',
        redirectTo: '/app/(myfiles//dialog:account)',
      },
      {
        path: 'members',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Archive Members',
          dialogToken: 'MembersDialogComponent',
          dialogOptions: { width: '1000px' },
        },
        resolve: { members: MembersResolveService },
      },
      {
        path: 'members',
        redirectTo: '/app/(myfiles//dialog:members)',
      },
      {
        path: 'archive/members',
        redirectTo: '/app/(myfiles//dialog:members)',
      },
      {
        path: 'settings',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Archive Settings',
          dialogToken: 'ArchiveSettingsDialogComponent',
          dialogOptions: { width: '1000px' },
        },
      },
      {
        path: 'settings',
        redirectTo: '/app/(myfiles//dialog:settings)',
      },
      {
        path: 'welcome',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Welcome!',
          dialogToken: 'WelcomeDialogComponent',
          dialogOptions: { width: '600px' },
        },
      },
      {
        path: 'welcome',
        redirectTo: '/app/(myfiles//dialog:welcome)',
      },
      {
        path: 'welcomeinvitation',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Welcome!',
          dialogToken: 'WelcomeInvitationDialogComponent',
          dialogOptions: { width: '600px' },
        },
      },
      {
        path: 'welcome-invitation',
        redirectTo: '/app/(myfiles//dialog:welcomeinvitation)',
      },
      {
        path: 'storage',
        component: RoutedDialogWrapperComponent,
        outlet: 'dialog',
        data: {
          title: 'Storage',
          dialogToken: 'StorageDialogComponent',
          dialogOptions: { width: '1000px' },
        },
      },
      {
        path: 'storage',
        redirectTo: '/app/(myfiles//dialog:storage)',
      },
      {
        path: 'search',
        component: GlobalSearchResultsComponent,
        data: { title: 'Search' },
        resolve: { loadTags: TagsResolveService },
      },
      {
        path: 'switching',
        component: LoadingArchiveComponent,
      },
      { path: '**', redirectTo: 'myfiles' },
    ],
  },
  { path: 'm', redirectTo: 'app' },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: ':path', redirectTo: 'app/:path' },
];
@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  providers: [
    FolderResolveService,
    RootFolderResolveService,
    RecordResolveService,
    ArchivesResolveService,
    RelationshipsResolveService,
    MembersResolveService,
    AccountResolveService,
    ProfileItemsResolveService,
    TagsResolveService,
  ],
  declarations: [],
})
export class CoreRoutingModule {}
