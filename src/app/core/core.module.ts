import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from '@core/core.routes';
import { SharedModule } from '@shared/shared.module';

import { DataService } from '@shared/services/data/data.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { ArchiveSwitcherComponent } from './components/archive-switcher/archive-switcher.component';
import { FolderPickerComponent } from '@core/components/folder-picker/folder-picker.component';
import { DonateComponent } from './components/donate/donate.component';
import { InvitationsComponent } from './components/invitations/invitations.component';
import { RelationshipsComponent } from './components/relationships/relationships.component';
import { DialogModule } from '@root/app/dialog/dialog.module';
import { MembersComponent } from './components/members/members.component';
import { MultiSelectStatusComponent } from './components/multi-select-status/multi-select-status.component';
import { EditService } from './services/edit/edit.service';
import { RouterModule } from '@angular/router';
import { DragService } from '@shared/services/drag/drag.service';
import { SearchModule } from '@search/search.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule,
    RouterModule,
    DialogModule,
    SearchModule
  ],
  declarations: [
    MainComponent,
    NavComponent,
    LeftMenuComponent,
    RightMenuComponent,
    UploadProgressComponent,
    UploadButtonComponent,
    ArchiveSwitcherComponent,
    FolderPickerComponent,
    DonateComponent,
    InvitationsComponent,
    RelationshipsComponent,
    MembersComponent,
    MultiSelectStatusComponent,
    AccountSettingsComponent
  ],
  providers: [
    DataService,
    FolderViewService,
    FolderPickerService,
    UploadService,
    EditService,
    DragService
  ]
})
export class CoreModule {
}
