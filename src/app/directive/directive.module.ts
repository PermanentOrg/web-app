/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectiveDisplayComponent } from './components/directive-display/directive-display.component';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faChevronLeft,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { DirectiveEditComponent } from './components/directive-edit/directive-edit.component';
import { FormsModule } from '@angular/forms';
import { DirectiveDialogComponent } from './components/directive-dialog/directive-dialog.component';
import { LegacyContactDisplayComponent } from './components/legacy-contact-display/legacy-contact-display.component';
import { LegacyContactEditComponent } from './components/legacy-contact-edit/legacy-contact-edit.component';
@NgModule({
  exports: [
    DirectiveDisplayComponent,
    DirectiveEditComponent,
    DirectiveDialogComponent,
    LegacyContactDisplayComponent,
    LegacyContactEditComponent,
  ],
  declarations: [
    DirectiveDisplayComponent,
    DirectiveEditComponent,
    DirectiveDialogComponent,
    LegacyContactDisplayComponent,
    LegacyContactEditComponent,
  ],
  imports: [CommonModule, FontAwesomeModule, FormsModule],
})
export class DirectiveModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faExclamationTriangle, faChevronLeft);
  }
}
