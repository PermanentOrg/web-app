import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectiveDisplayComponent } from './components/directive-display/directive-display.component';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DirectiveEditComponent } from './components/directive-edit/directive-edit.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  exports: [DirectiveDisplayComponent, DirectiveEditComponent],
  declarations: [DirectiveDisplayComponent, DirectiveEditComponent],
  imports: [CommonModule, FontAwesomeModule, FormsModule],
})
export class DirectiveModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faExclamationTriangle);
  }
}
