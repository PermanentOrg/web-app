import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainComponent } from '@core/components/main/main.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { ArchivesResolveService } from '@core/resolves/archives-resolve.service';
import { SharedModule } from '@shared/shared.module';
import { ArchiveSwitcherComponent } from '@shared/components/archive-switcher/archive-switcher.component';
import { GlobalSearchResultsComponent } from '@search/components/global-search-results/global-search-results.component';
import { RoutedDialogWrapperComponent } from '@shared/components/routed-dialog-wrapper/routed-dialog-wrapper.component';
import { RoutesWithData } from '../app.routes';
import { RelationshipsResolveService } from './resolves/relationships-resolve.service';
import { MembersResolveService } from './resolves/members-resolve.service';
import { AccountResolveService } from './resolves/account-resolve.service';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileItemsResolveService } from './resolves/profile-items-resolve.service';
import { TagsResolveService } from './resolves/tags.resolve.service';
import { AllArchivesComponent } from './components/all-archives/all-archives.component';
import { MyfilesGuard } from './guards/myfiles.guard';
import { ConnectionsDialogComponent } from './components/connections-dialog/connections-dialog.component';
import { StorageDialogComponent } from './components/storage-dialog/storage-dialog.component';
import { WelcomeInvitationDialogComponent } from './components/welcome-invitation-dialog/welcome-invitation-dialog.component';
import { WelcomeDialogComponent } from './components/welcome-dialog/welcome-dialog.component';
import { ArchiveSettingsDialogComponent } from './components/archive-settings-dialog/archive-settings-dialog.component';
import { MembersDialogComponent } from './components/members-dialog/members-dialog.component';
import { AccountSettingsDialogComponent } from './components/account-settings-dialog/account-settings-dialog.component';
import { InvitationsDialogComponent } from './components/invitations-dialog/invitations-dialog.component';

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
				children: [
					{
						path: '**',
						children: [],
						canActivate: [MyfilesGuard],
					},
				],
				canActivate: [MyfilesGuard],
			},
			{
				path: 'private',
				loadChildren: async () =>
					await import('../file-browser/file-browser.module').then(
						(m) => m.FileBrowserModule,
					),
				data: {
					title: 'Private Files',
					showSidebar: true,
					showFolderViewToggle: true,
				},
			},
			{
				path: 'public',
				loadChildren: async () =>
					await import('../file-browser/file-browser.module').then(
						(m) => m.FileBrowserModule,
					),
				data: {
					title: 'Public',
					showSidebar: true,
					showFolderViewToggle: true,
				},
			},
			{
				path: 'apps',
				loadChildren: async () =>
					await import('../apps/apps.module').then((m) => m.AppsModule),
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
				loadChildren: async () =>
					await import('../shares/shares.module').then((m) => m.SharesModule),
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
				redirectTo: '/app/(private//dialog:storage)',
			},
			{
				path: 'invitations',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Invitations',
					component: InvitationsDialogComponent,
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'invitations',
				redirectTo: '/app/(private//dialog:invitations)',
			},
			{
				path: 'archive/sentInvites',
				redirectTo: '/app/(private//dialog:invitations)',
			},
			{
				path: 'connections',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Connections',
					component: ConnectionsDialogComponent,
					dialogOptions: { width: '1000px' },
				},
				resolve: { connections: RelationshipsResolveService },
			},
			{
				path: 'connections',
				redirectTo: '/app/(private//dialog:connections)',
			},
			{
				path: 'relationships',
				redirectTo: '/app/(private//dialog:connections)',
			},
			{
				path: 'archive/relationships',
				redirectTo: '/app/(private//dialog:connections)',
			},
			{
				path: 'relationship_request/:email',
				redirectTo: '/app/(private//dialog:connections)',
			},
			{
				path: 'profile',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Archive Profile',
					component: ProfileEditComponent,
					dialogOptions: {
						width: '100%',
						height: 'fullscreen',
					},
				},
				resolve: { profileItems: ProfileItemsResolveService },
			},
			{
				path: 'profile',
				redirectTo: '/app/(private//dialog:profile)',
			},
			{
				path: 'account',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Account',
					component: AccountSettingsDialogComponent,
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'account',
				redirectTo: '/app/(private//dialog:account)',
			},
			{
				path: 'security',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Account',
					component: AccountSettingsDialogComponent,
					tab: 'security',
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'security',
				redirectTo: '/app/(private//dialog:security)',
			},
			{
				path: 'legacy-contact',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Account',
					component: AccountSettingsDialogComponent,
					tab: 'legacy-contact',
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'legacy-contact',
				redirectTo: '/app/(private//dialog:legacy-contact)',
			},
			{
				path: 'members',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Archive Members',
					component: MembersDialogComponent,
					dialogOptions: { width: '1000px' },
				},
				resolve: { members: MembersResolveService },
			},
			{
				path: 'members',
				redirectTo: '/app/(private//dialog:members)',
			},
			{
				path: 'archive/members',
				redirectTo: '/app/(private//dialog:members)',
			},
			{
				path: 'settings',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Archive Settings',
					component: ArchiveSettingsDialogComponent,
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'settings',
				redirectTo: '/app/(private//dialog:settings)',
			},
			{
				path: 'welcome',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Welcome!',
					component: WelcomeDialogComponent,
					dialogOptions: { width: '600px' },
				},
			},
			{
				path: 'welcome',
				redirectTo: '/app/(private//dialog:welcome)',
			},
			{
				path: 'welcomeinvitation',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Welcome!',
					component: WelcomeInvitationDialogComponent,
					dialogOptions: { width: '600px' },
				},
			},
			{
				path: 'welcome-invitation',
				redirectTo: '/app/(private//dialog:welcomeinvitation)',
			},
			{
				path: 'storage/:path',
				component: RoutedDialogWrapperComponent,
				outlet: 'dialog',
				data: {
					title: 'Storage',
					component: StorageDialogComponent,
					dialogOptions: { width: '1000px' },
				},
			},
			{
				path: 'storage/:path',
				redirectTo: '/app/(private//dialog:storage/:path)',
			},
			{
				path: 'storage',
				redirectTo: '/app/(private//dialog:storage/)',
			},
			{
				path: 'search',
				component: GlobalSearchResultsComponent,
				data: { title: 'Search' },
				resolve: { loadTags: TagsResolveService },
			},
			{ path: '**', redirectTo: 'private' },
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
