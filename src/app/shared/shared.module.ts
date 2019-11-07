import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { TermsComponent } from '@shared/components/terms/terms.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchivePickerComponent } from './components/archive-picker/archive-picker.component';
import { Dialog, DialogChildComponentData } from '../dialog/dialog.service';
import { DialogModule } from '../dialog/dialog.module';
import { IFrameService } from './services/iframe/iframe.service';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { FileSizePipe } from './pipes/filesize.pipe';
import { PrConstantsPipe } from './pipes/pr-constants.pipe';
import { PromptComponent } from './components/prompt/prompt.component';
import { ArchiveSwitcherDialogComponent } from './components/archive-switcher-dialog/archive-switcher-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule
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
    BreadcrumbsComponent,
    PromptComponent,
    FileSizePipe,
    PrConstantsPipe
  ],
  entryComponents: [
    ArchivePickerComponent,
    ArchiveSwitcherDialogComponent
  ],
  declarations: [
    FormInputComponent,
    LogoComponent,
    TermsComponent,
    BgImageSrcDirective,
    PromptComponent,
    ArchiveSmallComponent,
    ArchivePickerComponent,
    BreadcrumbsComponent,
    FileSizePipe,
    PrConstantsPipe,
    ArchiveSwitcherDialogComponent
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
    }
  ];

  constructor(private dialog: Dialog, private resolver: ComponentFactoryResolver) {
    this.dialog.registerComponents(this.dialogComponents, this.resolver, true);
  }
}
