/* @format */
import {
  Dialog,
  DialogChildComponentData,
} from '@root/app/dialog/dialog.module';
import { ComponentFactoryResolver, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { SkipOnboardingDialogComponent } from '@core/components/skip-onboarding-dialog/skip-onboarding-dialog.component';
import { ComponentsModule } from '../component-library/components.module';
import { DialogModule } from '../dialog/dialog.module';
import { DialogCdkModule } from '../dialog-cdk/dialog-cdk.module';
import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';
import { ArchiveTypeSelectComponent } from './components/archive-type-select/archive-type-select.component';
import { ArchiveCreationStartScreenComponent } from './components/archive-creation-start-screen/archive-creation-start-screen.component';

@NgModule({
  declarations: [
    OnboardingComponent,
    WelcomeScreenComponent,
    CreateNewArchiveComponent,
    ArchiveTypeSelectComponent,
    ArchiveCreationStartScreenComponent,
  ],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    SharedModule,
    CoreModule,
    DialogModule,
    DialogCdkModule,
    FontAwesomeModule,
    ComponentsModule,
  ],
})
export class OnboardingModule {
  private dialogComponents: DialogChildComponentData[] = [
    {
      token: 'SkipOnboardingDialogComponent',
      component: SkipOnboardingDialogComponent,
    },
  ];
  constructor(
    private dialog: Dialog,
    private resolver: ComponentFactoryResolver,
    private library: FaIconLibrary,
  ) {
    library.addIcons(faHeart);
    if (this.dialog) {
      this.dialog.registerComponents(
        this.dialogComponents,
        this.resolver,
        true,
      );
    }
  }
}
