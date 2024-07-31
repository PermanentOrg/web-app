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
import { DialogModule } from '../dialog/dialog.module';
import { DialogCdkModule } from '../dialog-cdk/dialog-cdk.module';
import { ComponentsModule } from '../component-library/components.module';
import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';
import { ArchiveTypeSelectComponent } from './components/archive-type-select/archive-type-select.component';
import { ArchiveCreationStartScreenComponent } from './components/archive-creation-start-screen/archive-creation-start-screen.component';
import { SelectArchiveTypeScreenComponent } from './components/select-archive-type-screen/select-archive-type-screen.component';
import { NameArchiveScreenComponent } from './components/name-archive-screen/name-archive-screen.component';
import { GlamArchiveTypeSelectComponent } from './components/glam/archive-type-select/archive-type-select.component';
import { ArchiveTypeIconComponent } from './components/glam/archive-type-icon/archive-type-icon.component';
import { CreateArchiveForMeScreenComponent } from './components/create-archive-for-me-screen/create-archive-for-me-screen.component';
import { FinalizeArchiveCreationScreenComponent } from './components/finalize-archive-creation-screen/finalize-archive-creation-screen.component';
import { GlamReasonsScreenComponent } from './components/glam-reasons-screen/glam-reasons-screen.component';
import { GlamGoalsScreenComponent } from './components/glam-goals-screen/glam-goals-screen.component';
import { GlamUserSurveySquareComponent } from './components/glam/glam-user-survey-square/glam-user-survey-square.component';
import { OnboardingHeaderComponent } from './components/header/header.component';
import { GlamOnboardingHeaderComponent } from './components/glam-header/glam-header.component';

@NgModule({
  declarations: [
    OnboardingComponent,
    WelcomeScreenComponent,
    CreateNewArchiveComponent,
    ArchiveTypeSelectComponent,
    ArchiveCreationStartScreenComponent,
    SelectArchiveTypeScreenComponent,
    NameArchiveScreenComponent,
    CreateArchiveForMeScreenComponent,
    FinalizeArchiveCreationScreenComponent,
    GlamReasonsScreenComponent,
    GlamGoalsScreenComponent,
    GlamUserSurveySquareComponent,
    OnboardingHeaderComponent,
    GlamOnboardingHeaderComponent,
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
    GlamArchiveTypeSelectComponent,
    ArchiveTypeIconComponent,
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
