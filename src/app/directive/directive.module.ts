import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { DirectiveDisplayComponent } from './components/directive-display/directive-display.component';

@NgModule({
  exports: [DirectiveDisplayComponent],
  declarations: [DirectiveDisplayComponent],
  imports: [CommonModule],
})
export class DirectiveModule {}
