import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharePreviewRoutingModule } from './share-preview.routes';

@NgModule({
	declarations: [],
	imports: [
		SharePreviewRoutingModule,
		CommonModule,
		FormsModule,
		NgbTooltipModule,
	],
	providers: [DataService, FolderViewService],
})
export class SharePreviewModule {
	constructor(folderView: FolderViewService) {
		folderView.setFolderView(FolderView.Grid, true);
	}
}
