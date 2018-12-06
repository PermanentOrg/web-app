// tslint:disable-next-line:max-line-length
import { Injectable, ApplicationRef, ElementRef, ComponentRef, ComponentFactory, ComponentFactoryResolver, Injector, InjectionToken } from '@angular/core';
import { PortalInjector } from '@root/vendor/portal-injector';
import { DialogComponent } from './dialog.component';
import { Deferred } from '@root/vendor/deferred';

export class DialogRef {
  componentRef?: ComponentRef<any>;
  closeDeferred?: Deferred = new Deferred();

  constructor(public id: number, private dialog: Dialog) {
  }

  close(closeData?: any) {
    this.dialog.close(this);
    this.closeDeferred.resolve(closeData);
  }

  destroy() {
    this.componentRef.destroy();
  }
}

export const DIALOG_DATA = new InjectionToken<any>('DialogData');

@Injectable({
  providedIn: 'root'
})
export class Dialog {
  private rootComponent: DialogComponent;
  private currentId = 0;

  private registeredComponents: {[token: string]: any} = {};
  private componentResolvers: {[token: string]: any} = {};
  private dialogs: {[id: number]: DialogRef} = {};

  constructor(
    private app: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector
  ) {
  }

  registerRootComponent(component: DialogComponent) {
    if (this.rootComponent) {
      throw new Error(`Dialog - root dialog component already exists`);
    }

    this.rootComponent = component;
  }

  registerComponent(component: any, resolver = this.resolver, allowDupes?: boolean) {
    if (!this.registeredComponents[component.name]) {
      this.registeredComponents[component.name] = component;
      this.componentResolvers[component.name] = resolver;
    } else if (!allowDupes) {
      throw new Error(`Dialog - component with name ${component.name} already registered`);
    }
  }

  registerComponents(components: any[], resolver?: ComponentFactoryResolver, allowDupes?: boolean) {
    components.map((component) => {
      this.registerComponent(component, resolver, allowDupes);
    });
  }

  unregisterComponent(component: any) {
    delete this.registeredComponents[component.name];
  }

  unregisterComponents(components: any[]) {
    components.map((component) => {
      this.unregisterComponent(component);
    });
  }

  open(token: any, data: any): Promise<any> {
    if (!this.rootComponent) {
      throw new Error(`Dialog - root component not found`);
    }

    if (!this.registeredComponents[token]) {
      throw new Error(`Dialog - component with name ${token} not found`);
    }

    const newDialog = this.createDialog(token, data);
    return newDialog.closeDeferred.promise;
  }

  close(dialogRef: DialogRef) {
    const id = dialogRef.id;
    this.rootComponent.hide();
    setTimeout(() => {
      this.dialogs[id].destroy();
      delete this.dialogs[id];
    }, 500);
  }

  private createDialog(token: string, data: any = {}): DialogRef {
    const dialog = new DialogRef(this.currentId++, this);
    const component = this.registeredComponents[token];
    const resolver = this.componentResolvers[token];

    const injector = new PortalInjector(this.injector, new WeakMap<any, any>([[DIALOG_DATA, data], [DialogRef, dialog]]));
    const factory: ComponentFactory<any> = resolver.resolveComponentFactory(component);

    dialog.componentRef = this.rootComponent.viewContainer.createComponent(factory, undefined, injector),

    this.dialogs[dialog.id] = dialog;

    this.rootComponent.show();
    return dialog;
  }
}
