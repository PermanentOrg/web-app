import { NgModule, ComponentFactoryResolver, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from '@core/core.routes';
import { SharedModule } from '@shared/shared.module';

import { DataService } from '@shared/services/data/data.service';
import { UploadService } from '@core/services/upload/upload.service';
import { Uploader } from '@core/services/upload/uploader';
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
import { DialogModule, DialogChildComponentData, Dialog } from '@root/app/dialog/dialog.module';
import { MembersComponent } from './components/members/members.component';
import { MultiSelectStatusComponent } from './components/multi-select-status/multi-select-status.component';
import { EditService } from './services/edit/edit.service';
import { RouterModule } from '@angular/router';
import { DragService } from '@shared/services/drag/drag.service';
import { SearchModule } from '@search/search.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { ArchiveSelectorComponent } from './components/archive-selector/archive-selector.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { NotificationPreferencesComponent } from './components/notification-preferences/notification-preferences.component';
import { PortalModule } from '@angular/cdk/portal';
import { SidebarActionPortalService } from './services/sidebar-action-portal/sidebar-action-portal.service';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { AllArchivesComponent } from './components/all-archives/all-archives.component';
import { ConnectionsDialogComponent } from './components/connections-dialog/connections-dialog.component';
import { MembersDialogComponent } from './components/members-dialog/members-dialog.component';
import { ProfileEditTopicComponent } from './components/profile-edit-topic/profile-edit-topic.component';
import { ProfileService } from '@shared/services/profile/profile.service';
import { MyArchivesDialogComponent } from './components/my-archives-dialog/my-archives-dialog.component';
import { InvitationsDialogComponent } from './components/invitations-dialog/invitations-dialog.component';
import { LoadingArchiveComponent } from './components/loading-archive/loading-archive.component';
import { CountUpModule } from 'countup.js-angular2';
import { ProfileEditFirstTimeDialogComponent } from './components/profile-edit-first-time-dialog/profile-edit-first-time-dialog.component';
import { StorageDialogComponent } from './components/storage-dialog/storage-dialog.component';
import { FileHistoryComponent } from './components/file-history/file-history.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { BillingSettingsComponent } from './components/billing-settings/billing-settings.component';
import { NotificationsModule } from '../notifications/notifications.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule,
    RouterModule,
    DialogModule,
    SearchModule,
    PortalModule,
    CountUpModule,
    NotificationsModule
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
    AccountSettingsComponent,
    BillingSettingsComponent,
    NotificationPreferencesComponent,
    ArchiveSelectorComponent,
    ProfileEditComponent,
    SettingsDialogComponent,
    AllArchivesComponent,
    ConnectionsDialogComponent,
    MembersDialogComponent,
    InvitationsDialogComponent,
    ProfileEditTopicComponent,
    MyArchivesDialogComponent,
    LoadingArchiveComponent,
    ProfileEditFirstTimeDialogComponent,
    StorageDialogComponent,
    FileHistoryComponent,
    TransactionHistoryComponent
  ],
  providers: [
    DataService,
    FolderViewService,
    FolderPickerService,
    ProfileService,
    UploadService,
    Uploader,
    EditService,
    DragService,
    SidebarActionPortalService
  ]
})
export class CoreModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'SettingsDialogComponent',
      component: SettingsDialogComponent
    },
    {
      token: 'ConnectionsDialogComponent',
      component: ConnectionsDialogComponent
    },
    {
      token: 'ProfileEditComponent',
      component: ProfileEditComponent
    },
    {
      token: 'ProfileEditFirstTimeDialogComponent',
      component: ProfileEditFirstTimeDialogComponent
    },
    {
      token: 'MembersDialogComponent',
      component: MembersDialogComponent
    },
    {
      token: 'MyArchivesDialogComponent',
      component: MyArchivesDialogComponent
    },
    {
      token: 'InvitationsDialogComponent',
      component: InvitationsDialogComponent
    },
    {
      token: 'StorageDialogComponent',
      component: StorageDialogComponent
    }
  ];

  constructor(
    @Optional() private dialog?: Dialog,
    @Optional() private resolver?: ComponentFactoryResolver,
  ) {
    if (this.dialog) {
      this.dialog.registerComponents(this.dialogComponents, this.resolver, true);
    }
  }
}
