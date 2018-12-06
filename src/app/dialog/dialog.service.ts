// tslint:disable-next-line:max-line-length
import { Injectable, ApplicationRef, ElementRef, ComponentRef, ComponentFactory, ComponentFactoryResolver, Injector, InjectionToken } from '@angular/core';
import { PortalInjector } from '@root/vendor/portal-injector';
import { DialogComponent } from './dialog.component';
import { Deferred } from '@root/vendor/deferred';

export class DialogRef {
  componentRef?: ComponentRef<any>;
  closeDeferred?: Deferred = new Deferred();

  constructor(public id: number) {
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
    console.log('Root component registered!');
  }

  registerComponent(component: any) {
    if (!this.registeredComponents[component.name]) {
      this.registeredComponents[component.name] = component;
    } else {
      throw new Error(`Dialog - component with name ${component.name} already registered`);
    }
  }

  registerComponents(components: any[]) {
    components.map((component) => {
      this.registerComponent(component);
    });
  }

  open(token: any, data: any): Promise<any> {
    if (!this.registeredComponents[token]) {
      throw new Error(`Dialog - component with name ${token} not found`);
    }

    const newDialog = this.createDialog(token, data);
    return newDialog.closeDeferred.promise;
  }

  private createDialog(token: string, data: any = {}): DialogRef {
    const dialog = new DialogRef(this.currentId++);
    const component = this.registeredComponents[token];
    const injector = new PortalInjector(this.injector, new WeakMap<any, any>([[DIALOG_DATA, data], [DialogRef, dialog]]));
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(component);

    dialog.componentRef = this.rootComponent.viewContainer.createComponent(factory, undefined, injector),

    this.dialogs[dialog.id] = dialog;

    this.rootComponent.show();
    return dialog;
  }
}
