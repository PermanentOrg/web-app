/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from './components/toggle/toggle.component';
import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [ToggleComponent, ButtonComponent],
  imports: [CommonModule],
  exports: [ToggleComponent, ButtonComponent],
})
export class ComponentsModule {}
