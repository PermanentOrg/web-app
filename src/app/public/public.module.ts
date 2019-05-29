import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './components/test/test.component';
import { PublicRoutingModule } from './public.routes';
import { RouterModule } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule
  ],
  providers: [
    DataService,
    FolderViewService,
    PromptService,
    FolderPickerService
  ]
})
export class PublicModule { }
