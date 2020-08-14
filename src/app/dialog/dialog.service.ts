// tslint:disable-next-line:max-line-length
import { Injectable, ApplicationRef, ElementRef, ComponentRef, ComponentFactory, ComponentFactoryResolver, Injector, InjectionToken, Inject, ViewChild } from '@angular/core';
import { PortalInjector } from '@root/vendor/portal-injector';
import { DialogComponent } from './dialog.component';
import { Deferred } from '@root/vendor/deferred';
import { DialogRootComponent } from './dialog-root.component';
import { DOCUMENT } from '@angular/common';
import debug from 'debug';
import { PortalOutlet } from '@angular/cdk/portal';

type DialogComponentToken =
  'FamilySearchImportComponent' |
  'ArchivePickerComponent' |
  'SharingComponent' |
  'ArchiveSwitcherDialogComponent' |
  'SettingsDialogComponent' |
  'ConnectionsDialogComponent' |
  'TimelineCompleteDialogComponent' |
  'LocationPickerComponent' |
  'EditTagsComponent' |
  'PublishComponent' |
  'ProfileEditComponent' |
  'MembersDialogComponent' |
  'InvitationsDialogComponent'
  ;

export interface DialogChildComponentData {
  token: DialogComponentToken;
  component: any;
}

export interface DialogOptions {
  height?: 'auto' | 'fullscreen';
  width?: 'auto' | 'fullscreen' | any;
  menuClass?: string;
}

const DEFAULT_OPTIONS: DialogOptions = {
  height: 'fullscreen'
};


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

  public portalOutlet: PortalOutlet;

  public registeredComponents: {[token: string]: any} = {};
  public componentResolvers: {[token: string]: any} = {};

  private dialogs: {[id: number]: DialogRef} = {};

  private bodyScrollAllowed = true;

  private debug = debug('service:dialogService');

  constructor(
    private app: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  setDialogModuleResolver(resolver: ComponentFactoryResolver) {
    this.dialogModuleResolver = resolver;
  }

  registerRootComponent(component: DialogRootComponent) {
    if (this.rootComponent) {
      throw new Error(`Dialog - root dialog component already registered`);
    }

    this.rootComponent = component;
  }

  unregisterRootComponent(component?: any) {
    delete this.rootComponent;
  }

  registerComponent(componentData: DialogChildComponentData, resolver = this.resolver, allowDupes?: boolean) {
    if (!this.registeredComponents[componentData.token]) {
      this.registeredComponents[componentData.token] = componentData.component;
      this.componentResolvers[componentData.token] = resolver;
      this.debug('register component %s', componentData.token);
    } else if (!allowDupes) {
      throw new Error(`Dialog - component with token ${componentData.token} already registered`);
    }
  }

  registerComponents(components: DialogChildComponentData[], resolver?: ComponentFactoryResolver, allowDupes?: boolean) {
    components.map((componentData) => {
      this.registerComponent(componentData, resolver, allowDupes);
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

  registerPortalOutlet(outlet: PortalOutlet) {
    if (this.portalOutlet) {
      throw new Error(`Dialog - portal outlet already registered. Make sure to unregister when destroying.`);
    }

    this.portalOutlet = outlet;
    this.debug('portal outlet registered %o', outlet);
  }

  unregisterPortalOutlet(outlet: PortalOutlet) {
    if (this.portalOutlet !== outlet) {
      throw new Error(`Dialog - attempting to unregister incorrect portal outlet`);
    }

    this.portalOutlet = null;
    this.debug('portal outlet unregistered %o', outlet);
  }

  open(token: DialogComponentToken, data?: any, options = DEFAULT_OPTIONS): Promise<any> {
    if (!this.rootComponent) {
      throw new Error(`Dialog - root component not found`);
    }

    if (!this.registeredComponents[token]) {
      throw new Error(`Dialog - component with name ${token} not found`);
    }

    if (typeof token !== 'string') {
      token = (token as any).name;
    }

    const newDialog = this.createDialog(token, data, options);
    newDialog.dialogComponent.show();

    this.debug('open dialog %s %o %o', token, data, options);

    if (this.bodyScrollAllowed) {
      this.document.body.style.overflow = 'hidden';
      this.bodyScrollAllowed = false;
    }

    return newDialog.closePromise;
  }

  close(dialogRef: DialogRef) {
    // trigger hide animation
    dialogRef.dialogComponent.hide();

    // timeout for animation to complete before destroy
    setTimeout(() => {
      dialogRef.destroy();
      delete this.dialogs[dialogRef.id];

      if (Object.keys(this.dialogs).length < 1) {
        if (!this.bodyScrollAllowed) {
          this.document.body.style.overflow = '';
          this.bodyScrollAllowed = true;
        }
      }
    }, 500);
  }

  public createDialog(token: string, data: any = {}, options = DEFAULT_OPTIONS): DialogRef {
    // create new dialog metadata
    const dialog = new DialogRef(this.currentId++, this);
    this.dialogs[dialog.id] = dialog;

    // create new dialog component to wrap custom component
    const dialogComponentFactory = this.dialogModuleResolver.resolveComponentFactory(DialogComponent);
    dialog.dialogComponentRef = this.rootComponent.viewContainer.createComponent(dialogComponentFactory, undefined, this.injector);
    dialog.dialogComponent = dialog.dialogComponentRef.instance;

    // set dialog options and ref
    dialog.dialogComponent.setOptions(options);
    dialog.dialogComponent.bindDialogRef(dialog);

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
