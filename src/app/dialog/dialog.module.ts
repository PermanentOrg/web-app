import { NgModule, ModuleWithProviders, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { Dialog, DialogRef, DIALOG_DATA, OUTLET_TEMPLATE, DialogChildComponentData, DialogComponentToken } from './dialog.service';
import { DialogComponent } from './dialog.component';
import { DialogRootComponent } from './dialog-root.component';

export {
  Dialog,
  DialogRef,
  DialogRootComponent,
  DIALOG_DATA,
  OUTLET_TEMPLATE,
  DialogChildComponentData,
  DialogComponentToken
};

export interface IsTabbedDialog {
  activeTab: any;
  setTab(tab: string);
  onDoneClick();
}

@NgModule({
  imports: [
    CommonModule,
    PortalModule
  ],
  declarations: [
    DialogRootComponent,
    DialogComponent,
  ],
  exports: [
    PortalModule,
    DialogRootComponent
  ]
})
export class DialogModule {
  constructor(private dialog: Dialog, resolver: ComponentFactoryResolver) {
    dialog.setDialogModuleResolver(resolver);
  }

  static forRoot(): ModuleWithProviders<DialogModule> {
    return {
      ngModule: DialogModule,
      providers: [ Dialog ],
    };
  }
}
