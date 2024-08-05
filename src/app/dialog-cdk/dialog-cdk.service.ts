import { Injectable, TemplateRef } from '@angular/core';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { BasePortalOutlet, ComponentType } from '@angular/cdk/portal';

export type DialogComponent = ComponentType<any> | TemplateRef<any>;

@Injectable({
  providedIn: 'root',
})
export class DialogCdkService {
  constructor(private dialog: Dialog) {}

  public open<T, U, V>(
    component: ComponentType<T> | TemplateRef<T>,
    config?: DialogConfig<V, DialogRef<U, T>, BasePortalOutlet>
  ): DialogRef<U, T> {
    return this.dialog.open(component, config);
  }
}
