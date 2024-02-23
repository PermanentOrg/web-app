/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent } from './components/form-input/form-input.component';
import { ButtonComponent } from './components/button/button.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [ToggleComponent, ButtonComponent, FormInputComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
  ],
  exports: [],
})
export class ComponentsModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(faExclamationCircle);
  }
}
