import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharePreviewRoutingModule } from './share-preview.routes';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { MessageService } from '@shared/services/message/message.service';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
  ],
  imports: [
    SharePreviewRoutingModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule,
  ],
  providers: [
    DataService,
    FolderViewService,
    PromptService,
    FolderPickerService
  ]
})
export class SharePreviewModule {
  constructor(folderView: FolderViewService) {
    folderView.setFolderView(FolderView.Grid, true);
  }
}
