import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { RelationshipsComponent } from './components/relationships/relationships.component';
import { MembersComponent } from './components/members/members.component';
import { MembersResolveService } from './resolves/members-resolve.service';
import { LeanFolderResolveService } from './resolves/lean-folder-resolve.service';

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
      {
        path: 'myfiles',
        loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
        data: { title: 'My Files', showSidebar: true }
      },
      { path: 'public', loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule', data: { title: 'Public'} },
      { path: 'apps', loadChildren: '@apps/apps.module#AppsModule', data: { title: 'Apps'} },
      { path: 'shares', loadChildren: '@shares/shares.module#SharesModule', data: { title: 'Shares'} },
      {
        path: 'choosearchive',
        component: ArchiveSwitcherComponent,
        data: { title: 'Choose Archive'},
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
        component: InvitationsComponent,
        data: { title: 'Invitations' }
      },
      {
        path: 'archive/sentInvites',
        redirectTo: 'invitations'
      },
      {
        path: 'relationships',
        component: RelationshipsComponent,
        data: { title: 'Relationships' },
        resolve: { relations: RelationshipsResolveService }
      },
      {
        path: 'archive/relationships',
        redirectTo: 'relationships'
      },
      {
        path: 'relationship_request/:email',
        redirectTo: 'relationships'
      },
      {
        path: 'members',
        component: MembersComponent,
        data: { title: 'Members' },
        resolve: { members: MembersResolveService }
      },
      {
        path: 'archive/members',
        redirectTo: 'members'
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
    DonateResolveService,
    RelationshipsResolveService,
    MembersResolveService
  ],
  declarations: []
})
export class CoreRoutingModule { }

