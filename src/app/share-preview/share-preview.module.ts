import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharePreviewRoutingModule } from './share-preview.routes';
import { CreateAccountDialogComponent } from './components/create-account-dialog/create-account-dialog.component';
import { SharePreviewFooterComponent } from './components/share-preview-footer/share-preview-footer.component';

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
