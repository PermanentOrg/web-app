/* @format */
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchivePickerComponent } from './components/archive-picker/archive-picker.component';
import { Dialog, DialogChildComponentData } from '../dialog/dialog.service';
import { DialogModule } from '../dialog/dialog.module';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { RouterModule, Scroll } from '@angular/router';
import { FileSizePipe } from './pipes/filesize.pipe';
import { PrConstantsPipe } from './pipes/pr-constants.pipe';
import { PromptComponent } from './components/prompt/prompt.component';
import { ArchiveSwitcherDialogComponent } from './components/archive-switcher-dialog/archive-switcher-dialog.component';
import { TimelineCompleteDialogComponent } from './components/timeline-complete-dialog/timeline-complete-dialog.component';
import { PublicLinkPipe } from './pipes/public-link.pipe';
import { ShareActionLabelPipe } from './pipes/share-action-label.pipe';
import { NewlineTextPipe } from './pipes/newline-text.pipe';
import { AccountDropdownComponent } from './components/account-dropdown/account-dropdown.component';
import { InlineValueEditComponent } from './components/inline-value-edit/inline-value-edit.component';
import { BreadcrumbComponent } from './components/breadcrumbs/breadcrumb.component';
import { DragTargetRouterLinkDirective } from './directives/drag-target-router-link.directive';
import { PublicRoutePipe } from './pipes/public-route.pipe';
import { FolderViewToggleComponent } from './components/folder-view-toggle/folder-view-toggle.component';
import {
  NgbDatepickerModule,
  NgbDatepickerConfig,
  NgbTimepickerModule,
  NgbTimepickerConfig,
  NgbTooltipModule,
  NgbTooltipConfig,
  NgbDropdownModule,
  NgbDropdownConfig,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PrDatePipe } from './pipes/pr-date.pipe';
import { FolderCastPipe, RecordCastPipe } from './pipes/cast.pipe';
import { FolderContentsPipe } from './pipes/folder-contents.pipe';
import { StaticMapComponent } from './components/static-map/static-map.component';
import { PrLocationPipe } from './pipes/pr-location.pipe';
import { TagsComponent } from './components/tags/tags.component';
import { TooltipsPipe } from './pipes/tooltips.pipe';
import { PublicViewLinkPipe } from './pipes/public-view-link.pipe';
import { StorageMeterComponent } from './components/storage-meter/storage-meter.component';
import { StorageAmountPipe } from './pipes/storage-amount.pipe';
import { AudioComponent } from './components/audio/audio.component';
import { ScrollSectionDirective } from './directives/scroll-section.directive';
import { ScrollNavDirective } from './directives/scroll-nav.directive';
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { RoutedDialogWrapperComponent } from './components/routed-dialog-wrapper/routed-dialog-wrapper.component';
import { LinkPipe } from './pipes/link.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ItemTypeIconPipe } from './pipes/item-type-icon.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ArchiveSearchBoxComponent } from './components/archive-search-box/archive-search-box.component';
import { NewArchiveFormComponent } from './components/new-archive-form/new-archive-form.component';
import { PrependProtocolPipe } from './pipes/prepend-protocol.pipe';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faFileArchive, fas } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbPaginationModule,
    FontAwesomeModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormInputComponent,
    LogoComponent,
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
    TooltipsPipe,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbPaginationModule,
    PublicViewLinkPipe,
    StorageAmountPipe,
    StorageMeterComponent,
    AudioComponent,
    ThumbnailComponent,
    ScrollNavDirective,
    ScrollSectionDirective,
    RoutedDialogWrapperComponent,
    LinkPipe,
    TimeAgoPipe,
    ItemTypeIconPipe,
    SafeHtmlPipe,
    ArchiveSearchBoxComponent,
    NewArchiveFormComponent,
    PrependProtocolPipe,
  ],
  declarations: [
    ThumbnailComponent,
    FormInputComponent,
    LogoComponent,
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
    FolderCastPipe,
    RecordCastPipe,
    FolderContentsPipe,
    AccountDropdownComponent,
    InlineValueEditComponent,
    DragTargetRouterLinkDirective,
    FolderViewToggleComponent,
    StaticMapComponent,
    TagsComponent,
    TooltipsPipe,
    PublicViewLinkPipe,
    StorageAmountPipe,
    StorageMeterComponent,
    AudioComponent,
    ScrollSectionDirective,
    ScrollNavDirective,
    RoutedDialogWrapperComponent,
    LinkPipe,
    TimeAgoPipe,
    ItemTypeIconPipe,
    SafeHtmlPipe,
    ArchiveSearchBoxComponent,
    NewArchiveFormComponent,
    PrependProtocolPipe,
  ],
  providers: [PublicLinkPipe, PublicRoutePipe, PrLocationPipe, DatePipe],
})
export class SharedModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'ArchivePickerComponent',
      component: ArchivePickerComponent,
    },
    {
      token: 'ArchiveSwitcherDialogComponent',
      component: ArchiveSwitcherDialogComponent,
    },
    {
      token: 'TimelineCompleteDialogComponent',
      component: TimelineCompleteDialogComponent,
    },
  ];

  constructor(
    private dialog: Dialog,
    private resolver: ComponentFactoryResolver,
    private datePickerConfig: NgbDatepickerConfig,
    private timePickerConfig: NgbTimepickerConfig,
    private tooltipConfig: NgbTooltipConfig,
    private dropdownConfig: NgbDropdownConfig,
    private library: FaIconLibrary
  ) {
    library.addIcons(faFileArchive);
    this.dialog.registerComponents(this.dialogComponents, this.resolver, true);

    this.datePickerConfig.weekdays = false;
    this.datePickerConfig.minDate = {
      year: 1,
      day: 1,
      month: 1,
    };

    this.timePickerConfig.spinners = false;
    this.timePickerConfig.seconds = true;
    this.timePickerConfig.meridian = true;

    this.tooltipConfig.openDelay = 500;
    this.tooltipConfig.container = 'body';
    this.tooltipConfig.tooltipClass = 'pr-tooltip';
  }
}
