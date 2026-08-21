import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FileViewerComponent } from '@fileBrowser/components/file-viewer/file-viewer.component';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { fileListChildRoutes } from '@fileBrowser/file-browser.routes';
import { FileListComponent } from '@fileBrowser/components/file-list/file-list.component';
import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { SharedModule } from '@shared/shared.module';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { RoutesWithData } from '../app.routes';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';

const folderResolve = {
	currentFolder: FolderResolveService,
};

const recordResolve = {
	currentRecord: RecordResolveService,
};

export const routes: RoutesWithData = [
	{
		path: 'timeline',
		data: {
			folderView: FolderView.Timeline,
		},
		children: [
			{
				path: '',
				component: TimelineViewComponent,
				resolve: folderResolve,
				children: fileListChildRoutes,
			},
			{
				path: ':archiveNbr/:folderLinkId',
				component: TimelineViewComponent,
				resolve: folderResolve,
				children: [
					{
						path: 'record/:recArchiveNbr',
						component: FileViewerComponent,
						resolve: recordResolve,
					},
				],
			},
		],
	},
	{
		path: 'grid',
		data: {
			folderView: FolderView.Grid,
		},
		children: [
			{
				path: '',
				component: FileListComponent,
				resolve: folderResolve,
				children: fileListChildRoutes,
			},
			{
				path: ':archiveNbr/:folderLinkId',
				component: FileListComponent,
				resolve: folderResolve,
				children: fileListChildRoutes,
			},
		],
	},
];
@NgModule({
	imports: [
		RouterModule.forChild(routes),
		SharedModule,
		FileBrowserComponentsModule,
	],
	exports: [],
	providers: [RecordResolveService, FolderResolveService],
	declarations: [],
})
export class ViewsRoutingModule {}
