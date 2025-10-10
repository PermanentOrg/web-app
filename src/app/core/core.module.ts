import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from '@core/core.routes';
import { SharedModule } from '@shared/shared.module';
import { UploadService } from '@core/services/upload/upload.service';
import { UploadSession } from '@core/services/upload/upload.session';
import { Uploader } from '@core/services/upload/uploader';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { FolderPickerComponent } from '@core/components/folder-picker/folder-picker.component';
import { RouterModule } from '@angular/router';
import { DragService } from '@shared/services/drag/drag.service';
import { SearchModule } from '@search/search.module';
import { PortalModule } from '@angular/cdk/portal';
import { ProfileService } from '@shared/services/profile/profile.service';
import { CountUpModule } from 'ngx-countup';
import { NotificationsModule } from '../notifications/notifications.module';
import { PledgeModule } from '../pledge/pledge.module';
import { DialogCdkModule } from '../dialog-cdk/dialog-cdk.module';
import { DialogCdkService } from '../dialog-cdk/dialog-cdk.service';
import { AnnouncementModule } from '../announcement/announcement.module';
import { ManageMetadataModule } from '../archive-settings/manage-metadata/manage-metadata.module';
import { DirectiveModule } from '../directive/directive.module';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { UserChecklistModule } from '../user-checklist/user-checklist.module';
import { MultiSelectStatusComponent } from './components/multi-select-status/multi-select-status.component';
import { EditService } from './services/edit/edit.service';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { NotificationPreferencesComponent } from './components/notification-preferences/notification-preferences.component';
import { SidebarActionPortalService } from './services/sidebar-action-portal/sidebar-action-portal.service';
import { AccountSettingsDialogComponent } from './components/account-settings-dialog/account-settings-dialog.component';
import { AllArchivesComponent } from './components/all-archives/all-archives.component';
import { ConnectionsDialogComponent } from './components/connections-dialog/connections-dialog.component';
import { MembersDialogComponent } from './components/members-dialog/members-dialog.component';
import { MyArchivesDialogComponent } from './components/my-archives-dialog/my-archives-dialog.component';
import { InvitationsDialogComponent } from './components/invitations-dialog/invitations-dialog.component';
import { ProfileEditFirstTimeDialogComponent } from './components/profile-edit-first-time-dialog/profile-edit-first-time-dialog.component';
import { StorageDialogComponent } from './components/storage-dialog/storage-dialog.component';
import { FileHistoryComponent } from './components/file-history/file-history.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { BillingSettingsComponent } from './components/billing-settings/billing-settings.component';
import { ArchiveSettingsDialogComponent } from './components/archive-settings-dialog/archive-settings-dialog.component';
import { ManageTagsComponent } from './components/manage-tags/manage-tags.component';
import { WelcomeDialogComponent } from './components/welcome-dialog/welcome-dialog.component';
import { WelcomeInvitationDialogComponent } from './components/welcome-invitation-dialog/welcome-invitation-dialog.component';
import { PublicSettingsComponent } from './components/public-settings/public-settings.component';
import { ArchiveTypeChangeDialogComponent } from './components/archive-type-change-dialog/archive-type-change-dialog.component';
import { ArchivePayerComponent } from './components/archive-payer/archive-payer.component';
import { ConfirmPayerDialogComponent } from './components/confirm-payer-dialog/confirm-payer-dialog.component';
import { ArchiveStoragePayerComponent } from './components/archive-storage-payer/archive-storage-payer.component';
import { SkipOnboardingDialogComponent } from './components/skip-onboarding-dialog/skip-onboarding-dialog.component';
import { GiftStorageComponent } from './components/gift-storage/gift-storage.component';
import { ConfirmGiftDialogComponent } from './components/confirm-gift-dialog/confirm-gift-dialog.component';
import { AdvancedSettingsComponent } from './components/advanced-settings/advanced-settings.component';
import { AccountSecurityComponent } from './components/account-security/account-security.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { TwoFactorAuthComponent } from './components/two-factor-auth/two-factor-auth.component';
import { RedeemGiftComponent } from './components/redeem-gift/redeem-gift.component';

@NgModule({
	imports: [
		AnnouncementModule,
		CommonModule,
		SharedModule,
		CoreRoutingModule,
		RouterModule,
		SearchModule,
		PortalModule,
		CountUpModule,
		NotificationsModule,
		PledgeModule,
		ManageMetadataModule,
		DirectiveModule,
		FilesystemModule,
		UserChecklistModule,
		DialogCdkModule,
	],
	declarations: [
		MainComponent,
		NavComponent,
		LeftMenuComponent,
		RightMenuComponent,
		UploadProgressComponent,
		UploadButtonComponent,
		FolderPickerComponent,
		MultiSelectStatusComponent,
		AccountSettingsComponent,
		BillingSettingsComponent,
		NotificationPreferencesComponent,
		ProfileEditComponent,
		AccountSettingsDialogComponent,
		AllArchivesComponent,
		ConnectionsDialogComponent,
		MembersDialogComponent,
		InvitationsDialogComponent,
		MyArchivesDialogComponent,
		ProfileEditFirstTimeDialogComponent,
		StorageDialogComponent,
		FileHistoryComponent,
		TransactionHistoryComponent,
		ArchiveSettingsDialogComponent,
		ManageTagsComponent,
		WelcomeDialogComponent,
		WelcomeInvitationDialogComponent,
		PublicSettingsComponent,
		ArchiveTypeChangeDialogComponent,
		ArchivePayerComponent,
		ConfirmPayerDialogComponent,
		ArchiveStoragePayerComponent,
		SkipOnboardingDialogComponent,
		GiftStorageComponent,
		ConfirmGiftDialogComponent,
		AdvancedSettingsComponent,
		AccountSecurityComponent,
		ChangePasswordComponent,
		TwoFactorAuthComponent,
		RedeemGiftComponent,
	],
	providers: [
		FolderViewService,
		FolderPickerService,
		ProfileService,
		UploadService,
		UploadSession,
		Uploader,
		EditService,
		DragService,
		SidebarActionPortalService,
		DialogCdkService,
	],
})
export class CoreModule {}
