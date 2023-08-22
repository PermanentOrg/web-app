import {
  Dialog,
  DialogChildComponentData,
} from '@root/app/dialog/dialog.module';
import { ComponentFactoryResolver, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { SkipOnboardingDialogComponent } from '@core/components/skip-onboarding-dialog/skip-onboarding-dialog.component';
import { DialogModule } from '../dialog/dialog.module';
import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';

@NgModule({
  declarations: [
    OnboardingComponent,
    WelcomeScreenComponent,
    CreateNewArchiveComponent,
  ],
  imports: [CommonModule, OnboardingRoutingModule, SharedModule, CoreModule, DialogModule],
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
    private resolver: ComponentFactoryResolver
  ) {
    if (this.dialog) {
      this.dialog.registerComponents(
        this.dialogComponents,
        this.resolver,
        true
      );
    }
  }
}
