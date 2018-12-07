// tslint:disable-next-line:max-line-length
import { Injectable, ApplicationRef, ElementRef, ComponentRef, ComponentFactory, ComponentFactoryResolver, Injector, InjectionToken } from '@angular/core';
import { PortalInjector } from '@root/vendor/portal-injector';
import { DialogComponent } from './dialog.component';
import { Deferred } from '@root/vendor/deferred';
import { DialogRootComponent } from './dialog-root.component';

export class DialogRef {
  dialogComponentRef?: ComponentRef<DialogComponent>;
  dialogComponent?: DialogComponent;
  contentComponentRef?: ComponentRef<any>;

  closeDeferred?: Deferred = new Deferred();
  closePromise: Promise<any>;

  constructor(public id: number, private dialog: Dialog) {
    this.closePromise = this.closeDeferred.promise;
  }

  close(closeData?: any, cancelled?: boolean) {
    if (!cancelled) {
      this.closeDeferred.resolve(closeData);
    } else {
      this.closeDeferred.reject(closeData);
    }
    this.dialog.close(this);
  }

  destroy() {
    this.dialogComponentRef.destroy();
  }
}

export const DIALOG_DATA = new InjectionToken<any>('DialogData');

@Injectable({
  providedIn: 'root'
})
export class Dialog {
  private dialogModuleResolver: ComponentFactoryResolver;

  private rootComponent: DialogRootComponent;
  private currentId = 0;

  public registeredComponents: {[token: string]: any} = {};
  public componentResolvers: {[token: string]: any} = {};

  private dialogs: {[id: number]: DialogRef} = {};

  constructor(
    private app: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector
  ) {
  }

  setDialogModuleResolver(resolver: ComponentFactoryResolver) {
    this.dialogModuleResolver = resolver;
  }

  registerRootComponent(component: DialogRootComponent) {
    if (this.rootComponent) {
      throw new Error(`Dialog - root dialog component already exists`);
    }

    this.rootComponent = component;
    console.log('Root component registered!', component);
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
    newDialog.dialogComponent.show();
    return newDialog.closePromise;
  }

  close(dialogRef: DialogRef) {
    // trigger hide animation
    dialogRef.dialogComponent.hide();

    // timeout for animation to complete before destroy
    setTimeout(() => {
      dialogRef.destroy();
      delete this.dialogs[dialogRef.id];
    }, 500);
  }

  private createDialog(token: string, data: any = {}): DialogRef {
    // create new dialog metadata
    const dialog = new DialogRef(this.currentId++, this);
    this.dialogs[dialog.id] = dialog;

    // create new dialog component to wrap custom component
    const dialogComponentFactory = this.dialogModuleResolver.resolveComponentFactory(DialogComponent);
    dialog.dialogComponentRef = this.rootComponent.viewContainer.createComponent(dialogComponentFactory, undefined, this.injector);
    dialog.dialogComponent = dialog.dialogComponentRef.instance;

    // build custom component factory and setup injector
    const component = this.registeredComponents[token];
    const resolver = this.componentResolvers[token];
    const injector = new PortalInjector(this.injector, new WeakMap<any, any>([[DIALOG_DATA, data], [DialogRef, dialog]]));
    const factory: ComponentFactory<any> = resolver.resolveComponentFactory(component);

    // create custom component inside new dialog component
    dialog.contentComponentRef = dialog.dialogComponent.viewContainer.createComponent(factory, undefined, injector);

    return dialog;
  }
}
