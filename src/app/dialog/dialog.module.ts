import { NgModule, ModuleWithProviders, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef, DIALOG_DATA, DialogChildComponentData } from './dialog.service';
import { DialogComponent } from './dialog.component';
import { DialogRootComponent } from './dialog-root.component';

export { Dialog, DialogRef, DialogRootComponent, DIALOG_DATA, DialogChildComponentData };

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DialogRootComponent,
    DialogComponent,
  ],
  entryComponents: [
    DialogComponent
  ],
  exports: [
    DialogRootComponent
  ]
})
export class DialogModule {
  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    dialog.setDialogModuleResolver(resolver);
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DialogModule,
      providers: [ Dialog ],
    };
  }
}
