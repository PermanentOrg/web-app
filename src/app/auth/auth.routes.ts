import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '@shared/shared.module';

import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LoginComponent } from '@auth/components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mfa', component: MfaComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: '**', redirectTo: ''}
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    LoginComponent,
    MfaComponent,
    VerifyComponent,
    SignupComponent,
    ForgotPasswordComponent,
  ]
})
export class AuthRoutingModule { }

