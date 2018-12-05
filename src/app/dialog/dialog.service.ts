import { Injectable, ApplicationRef, ElementRef, ComponentRef, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { Deferred } from '@root/vendor/deferred';

interface DialogInterface {
  id: number;
  componentRef?: ComponentRef<any>;
  closeDeferred: Deferred;
}

@Injectable({
  providedIn: 'root'
})
export class Dialog {
  private rootComponent: DialogComponent;
  private currentId = 0;

  private registeredComponents: {[token: string]: any} = {};
  private dialogs: {[id: number]: DialogInterface} = {};

  constructor(
    private app: ApplicationRef,
    private resolver: ComponentFactoryResolver
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

  open(token: any): Promise<any> {
    if (!this.registeredComponents[token]) {
      throw new Error(`Dialog - component with name ${token} not found`);
    }

    const newDialog = this.createDialog(token);
    console.log('Dialog created?', newDialog);
    return newDialog.closeDeferred.promise;
  }

  private createDialog(token: string): DialogInterface {
    const component = this.registeredComponents[token];
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(component);

    const dialog = {
      id: this.currentId++,
      componentRef: this.rootComponent.container.createComponent(factory),
      closeDeferred: new Deferred()
    };

    this.dialogs[dialog.id] = dialog;
    return dialog;
  }
}
