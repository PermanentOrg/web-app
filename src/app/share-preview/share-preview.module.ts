import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharePreviewRoutingModule } from './share-preview.routes';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DialogModule } from '../dialog/dialog.module';

@NgModule({
  declarations: [
  ],
  imports: [
    SharePreviewRoutingModule,
    CommonModule,
    FormsModule,
    DialogModule,
    NgbTooltipModule
  ],
  providers: [
    DataService,
    FolderViewService,
    PromptService
  ]
})
export class SharePreviewModule {
  constructor(folderView: FolderViewService) {
    folderView.setFolderView(FolderView.Grid, true);
  }
}
