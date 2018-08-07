import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { LogoComponent } from '@auth/components/logo/logo.component';

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
    LogoComponent
  ],
  declarations: [
    FormInputComponent,
    LogoComponent
  ]
})
export class SharedModule { }
