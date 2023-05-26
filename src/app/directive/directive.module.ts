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
@NgModule({
  exports: [
    DirectiveDisplayComponent,
    DirectiveEditComponent,
    DirectiveDialogComponent,
  ],
  declarations: [
    DirectiveDisplayComponent,
    DirectiveEditComponent,
    DirectiveDialogComponent,
  ],
  imports: [CommonModule, FontAwesomeModule, FormsModule],
})
export class DirectiveModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faExclamationTriangle, faChevronLeft);
  }
}
