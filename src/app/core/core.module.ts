import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from '@core/core.routes';
import { SharedModule } from '@shared/shared.module';

import { DataService } from '@shared/services/data/data.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { BreadcrumbsComponent } from '@core/components/breadcrumbs/breadcrumbs.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { PromptComponent } from './components/prompt/prompt.component';
import { ArchiveSelectorComponent } from './components/archive-selector/archive-selector.component';
import { FolderPickerComponent } from '@core/components/folder-picker/folder-picker.component';
import { DonateComponent } from './components/donate/donate.component';
import { InvitationsComponent } from './components/invitations/invitations.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule,
  ],
  declarations: [
    MainComponent,
    NavComponent,
    LeftMenuComponent,
    RightMenuComponent,
    BreadcrumbsComponent,
    UploadProgressComponent,
    UploadButtonComponent,
    PromptComponent,
    ArchiveSelectorComponent,
    FolderPickerComponent,
    DonateComponent,
    InvitationsComponent
  ],
  providers: [
    DataService,
    FolderViewService,
    UploadService,
    PromptService,
    FolderPickerService
  ]
})
export class CoreModule { }
