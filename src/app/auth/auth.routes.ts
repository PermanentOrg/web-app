import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { ResetPasswordComponent } from '@auth/components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mfa', component: MfaComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'reset/:accountId/:token', component: ResetPasswordComponent },
  { path: 'reset_password/:accountId/:token', redirectTo: 'reset/:accountId/:token', pathMatch: 'full'},
  { path: '**', redirectTo: 'login'}
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
    ResetPasswordComponent
  ]
})
export class AuthRoutingModule { }

