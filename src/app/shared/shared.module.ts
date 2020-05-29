import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { TermsComponent } from '@shared/components/terms/terms.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchivePickerComponent } from './components/archive-picker/archive-picker.component';
import { Dialog, DialogChildComponentData } from '../dialog/dialog.service';
import { DialogModule } from '../dialog/dialog.module';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { FileSizePipe } from './pipes/filesize.pipe';
import { PrConstantsPipe } from './pipes/pr-constants.pipe';
import { PromptComponent } from './components/prompt/prompt.component';
import { ArchiveSwitcherDialogComponent } from './components/archive-switcher-dialog/archive-switcher-dialog.component';
import { TimelineCompleteDialogComponent } from './components/timeline-complete-dialog/timeline-complete-dialog.component';
import { PublicLinkPipe } from './pipes/public-link.pipe';
import { ShareActionLabelPipe } from './pipes/share-action-label.pipe';
import { NewlineTextPipe } from './pipes/newline-text.pipe';
import { AccountDropdownComponent } from './components/account-dropdown/account-dropdown.component';
import { TimeAgoV9Pipe } from './pipes/time-ago.pipe';
import { InlineValueEditComponent } from './components/inline-value-edit/inline-value-edit.component';
import { BreadcrumbComponent } from './components/breadcrumbs/breadcrumb.component';
import { DragTargetRouterLinkDirective } from './directives/drag-target-router-link.directive';
import { PublicRoutePipe } from './pipes/public-route.pipe';
import { FolderViewToggleComponent } from './components/folder-view-toggle/folder-view-toggle.component';
import { NgbDatepickerModule, NgbDatepickerConfig, NgbTimepickerModule, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { PrDatePipe } from './pipes/pr-date.pipe';
import { FolderCastPipe, RecordCastPipe } from './pipes/cast.pipe';
import { FolderContentsPipe } from './pipes/folder-contents.pipe';
import { StaticMapComponent } from './components/static-map/static-map.component';
import { PrLocationPipe } from './pipes/pr-location.pipe';
import { TagsComponent } from './components/tags/tags.component';
import { BetaToggleComponent } from './components/beta-toggle/beta-toggle.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule,
    NgbDatepickerModule,
    NgbTimepickerModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormInputComponent,
    LogoComponent,
    TermsComponent,
    BgImageSrcDirective,
    ArchiveSmallComponent,
    ArchivePickerComponent,
    TimelineCompleteDialogComponent,
    BreadcrumbComponent,
    BreadcrumbsComponent,
    PromptComponent,
    FileSizePipe,
    PrConstantsPipe,
    PublicLinkPipe,
    PublicRoutePipe,
    ShareActionLabelPipe,
    PrDatePipe,
    NewlineTextPipe,
    TimeAgoV9Pipe,
    FolderCastPipe,
    RecordCastPipe,
    FolderContentsPipe,
    PrLocationPipe,
    AccountDropdownComponent,
    InlineValueEditComponent,
    DragTargetRouterLinkDirective,
    FolderViewToggleComponent,
    StaticMapComponent,
    TagsComponent,
    BetaToggleComponent
  ],
  entryComponents: [
    ArchivePickerComponent,
    ArchiveSwitcherDialogComponent,
    TimelineCompleteDialogComponent
  ],
  declarations: [
    FormInputComponent,
    LogoComponent,
    TermsComponent,
    BgImageSrcDirective,
    PromptComponent,
    ArchiveSmallComponent,
    ArchivePickerComponent,
    BreadcrumbComponent,
    BreadcrumbsComponent,
    FileSizePipe,
    PrConstantsPipe,
    PublicLinkPipe,
    PublicRoutePipe,
    ShareActionLabelPipe,
    PrDatePipe,
    PrLocationPipe,
    ArchiveSwitcherDialogComponent,
    TimelineCompleteDialogComponent,
    NewlineTextPipe,
    TimeAgoV9Pipe,
    FolderCastPipe,
    RecordCastPipe,
    FolderContentsPipe,
    AccountDropdownComponent,
    InlineValueEditComponent,
    DragTargetRouterLinkDirective,
    FolderViewToggleComponent,
    StaticMapComponent,
    TagsComponent,
    BetaToggleComponent
  ],
  providers: [
    PublicLinkPipe,
    PublicRoutePipe,
    PrLocationPipe,
    DatePipe
  ]
})
export class SharedModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'ArchivePickerComponent',
      component: ArchivePickerComponent
    },
    {
      token: 'ArchiveSwitcherDialogComponent',
      component: ArchiveSwitcherDialogComponent
    },
    {
      token: 'TimelineCompleteDialogComponent',
      component: TimelineCompleteDialogComponent
    }
  ];

  constructor(
    private dialog: Dialog,
    private resolver: ComponentFactoryResolver,
    private datePickerConfig: NgbDatepickerConfig,
    private timePickerConfig: NgbTimepickerConfig
  ) {
    this.dialog.registerComponents(this.dialogComponents, this.resolver, true);

    this.datePickerConfig.showWeekdays = false;

    this.timePickerConfig.spinners = false;
    this.timePickerConfig.seconds = true;
    this.timePickerConfig.meridian = true;
  }
}
