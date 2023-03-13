import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectiveDisplayComponent } from './components/directive-display/directive-display.component';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
@NgModule({
  exports: [DirectiveDisplayComponent],
  declarations: [DirectiveDisplayComponent],
  imports: [CommonModule, FontAwesomeModule],
})
export class DirectiveModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faExclamationTriangle);
  }
}
