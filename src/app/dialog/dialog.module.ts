import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from './dialog.service';
import { DialogComponent } from './dialog.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    Dialog
  ],
  declarations: [
    DialogComponent
  ],
  exports: [
    DialogComponent
  ]
})
export class DialogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DialogModule,
      providers: [ Dialog ],
    };
  }
}
