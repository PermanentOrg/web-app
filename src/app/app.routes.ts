import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { RouterModule, Route } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { DialogConfig } from '@angular/cdk/dialog';
import { FolderVO, RecordVO } from './models';
import { DialogComponent } from './dialog-cdk/dialog-cdk.service';

export interface RouteData {
	title?: string;

	showSidebar?: boolean;
	showFolderViewToggle?: boolean;
	showFolderDescription?: boolean;

	singleFile?: boolean;

	checkFolderViewOnNavigate?: boolean;
	noFileListPadding?: boolean;
	fileListCentered?: boolean;
	isPublicArchive?: boolean;
	isPublic?: boolean;

	dialogOptions?: DialogConfig;

	folderView?: FolderView;

	component?: DialogComponent;

	currentFolder?: FolderVO;
	currentRecord?: RecordVO;

	tab?: string;
}

export interface RouteWithData extends Route {
	data?: RouteData;
	children?: RoutesWithData;
}

export type RoutesWithData = RouteWithData[];

const fusionauthHost = SecretsService.getStatic('FUSIONAUTH_HOST');
const customRedirects: RoutesWithData = [
	{
		path: 'wjma',
		redirectTo: '/p/archive/07r7-0000',
		pathMatch: 'full',
	},
];

const routes: RoutesWithData = [
	...customRedirects,
	{
		path: 'p',
		loadChildren: async () =>
			await import('./public/public.module').then((m) => m.PublicModule),
		data: {
			title: 'Public',
		},
	},
	{
		path: 'gallery',
		loadChildren: async () =>
			await import('./gallery/gallery.module').then((m) => m.GalleryModule),
		data: {
			title: 'Public Gallery',
		},
	},
	{
		path: 'share',
		loadChildren: async () =>
			await import('./share-preview/share-preview.module').then(
				(m) => m.SharePreviewModule,
			),
		data: {
			title: 'Sharing',
		},
	},
	{
		path: '',
		children: [
			{ path: 'app/login', redirectTo: 'app/auth/login', pathMatch: 'full' },
			{ path: 'app/signup', redirectTo: 'app/auth/signup', pathMatch: 'full' },
			{ path: 'app/sharing', redirectTo: 'app/auth/signup', pathMatch: 'full' },
			{ path: 'app/mfa', redirectTo: 'app/auth/mfa', pathMatch: 'full' },
			{ path: 'app/verify', redirectTo: 'app/auth/verify', pathMatch: 'full' },
			{ path: 'app/forgot', redirectTo: 'app/auth/forgot', pathMatch: 'full' },
			{ path: 'app/reset', redirectTo: 'app/auth/reset', pathMatch: 'full' },
			{
				path: 'app/fa-reset',
				loadChildren: async () =>
					await new Promise(() => {
						const url = window.location.href;
						const keyAndTenant = url.split('fa-reset')[1];
						window.location.href =
							fusionauthHost + '/password/change' + keyAndTenant;
					}),
				pathMatch: 'prefix',
			},
			{
				path: 'app/signupEmbed',
				redirectTo: 'app/embed/signup',
				pathMatch: 'full',
			},
			{
				path: 'app/verifyEmbed',
				redirectTo: 'app/embed/verify',
				pathMatch: 'full',
			},
			{
				path: 'app/doneEmbed',
				redirectTo: 'app/embed/done',
				pathMatch: 'full',
			},
			{
				path: 'app/auth',
				loadChildren: async () =>
					await import('./auth/auth.module').then((m) => m.AuthModule),
			},
			{
				path: 'app/embed',
				loadChildren: async () =>
					await import('./embed/embed.module').then((m) => m.EmbedModule),
			},
			{
				path: 'app/onboarding',
				loadChildren: async () =>
					await import('./onboarding/onboarding.module').then(
						(m) => m.OnboardingModule,
					),
			},
			{
				path: 'app/pledge',
				loadChildren: async () =>
					await import('./pledge/pledge.module').then((m) => m.PledgeModule),
			},
			{ path: 'm/embed', redirectTo: 'app/embed' },
			{ path: 'm/pledge', redirectTo: 'app/pledge' },
			{
				path: 'app/v3',
				loadChildren: async () =>
					await import('./v3/v3.module').then((m) => m.V3Module),
			},
			{
				path: '',
				loadChildren: async () =>
					await import('./core/core.module').then((m) => m.CoreModule),
			},
			{ path: '**', redirectTo: '', pathMatch: 'full' },
		],
	},
];

@NgModule({
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes, {
			paramsInheritanceStrategy: 'always',
			onSameUrlNavigation: 'reload',
		}),
		FormsModule,
		ReactiveFormsModule,
	],
	providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppRoutingModule {}
