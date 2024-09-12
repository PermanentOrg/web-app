/* @format */
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
import { DialogCdkModule } from '../dialog-cdk/dialog-cdk.module';
import { ComponentsModule } from '../component-library/components.module';
import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';
import { ArchiveTypeSelectComponent } from './components/archive-type-select/archive-type-select.component';
import { ArchiveCreationStartScreenComponent } from './components/glam/archive-creation-start-screen/archive-creation-start-screen.component';
import { SelectArchiveTypeScreenComponent } from './components/glam/select-archive-type-screen/select-archive-type-screen.component';
import { NameArchiveScreenComponent } from './components/glam/name-archive-screen/name-archive-screen.component';
import { GlamArchiveTypeSelectComponent } from './components/glam/archive-type-select/archive-type-select.component';
import { ArchiveTypeIconComponent } from './components/glam/archive-type-icon/archive-type-icon.component';
import { CreateArchiveForMeScreenComponent } from './components/glam/create-archive-for-me-screen/create-archive-for-me-screen.component';
import { FinalizeArchiveCreationScreenComponent } from './components/glam/finalize-archive-creation-screen/finalize-archive-creation-screen.component';
import { GlamReasonsScreenComponent } from './components/glam/glam-reasons-screen/glam-reasons-screen.component';
import { GlamGoalsScreenComponent } from './components/glam/glam-goals-screen/glam-goals-screen.component';
import { GlamUserSurveySquareComponent } from './components/glam/glam-user-survey-square/glam-user-survey-square.component';
import { OnboardingHeaderComponent } from './components/header/header.component';
import { GlamOnboardingHeaderComponent } from './components/glam/glam-header/glam-header.component';
import { GlamPendingArchivesComponent } from './components/glam-pending-archives/glam-pending-archives.component';
import { PendingArchiveComponent } from './components/glam/pending-archive/pending-archive.component';

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
    GlamPendingArchivesComponent,
    PendingArchiveComponent,
  ],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    SharedModule,
    CoreModule,
    DialogCdkModule,
    FontAwesomeModule,
    ComponentsModule,
    GlamArchiveTypeSelectComponent,
    ArchiveTypeIconComponent,
  ],
})
export class OnboardingModule {
  constructor(
    private resolver: ComponentFactoryResolver,
    private library: FaIconLibrary,
  ) {
    library.addIcons(faHeart);
  }
}
