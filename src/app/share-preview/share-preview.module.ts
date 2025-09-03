import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { EditService } from '@core/services/edit/edit.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { SharePreviewRoutingModule } from './share-preview.routes';

@NgModule({
	declarations: [],
	imports: [
		SharePreviewRoutingModule,
		CommonModule,
		FormsModule,
		NgbTooltipModule,
	],
	providers: [
		DataService,
		FolderViewService,
		RecordResolveService,
		EditService,
		FolderPickerService,
	],
})
export class SharePreviewModule {
	constructor(folderView: FolderViewService) {
		folderView.setFolderView(FolderView.Grid, true);
	}
}
