import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { TermsComponent } from '@shared/components/terms/terms.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormInputComponent,
    LogoComponent,
    TermsComponent,
    BgImageSrcDirective,
    ArchiveSmallComponent
  ],
  declarations: [
    FormInputComponent,
    LogoComponent,
    TermsComponent,
    BgImageSrcDirective,
    ArchiveSmallComponent
  ]
})
export class SharedModule { }
