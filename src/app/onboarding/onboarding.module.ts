import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';

import { SharedModule } from '@shared/shared.module';
import { DebuggerComponent } from './components/debugger/debugger.component';

@NgModule({
  declarations: [
    OnboardingComponent,
    WelcomeScreenComponent,
    CreateNewArchiveComponent,
    DebuggerComponent,
  ],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    SharedModule,
  ],
})
export class OnboardingModule { }
