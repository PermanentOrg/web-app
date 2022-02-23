import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { AuthComponent } from './components/auth/auth.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { ResetPasswordComponent } from '@auth/components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { TermsComponent } from '@shared/components/terms/terms.component';
import { ShareInviteResolveService } from './resolves/share-invite-resolve.service';

import { AuthGuard } from './guards/auth.guard';

export const childRoutes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: 'Log In' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Sign Up' }, resolve: { shareInviteData: ShareInviteResolveService }},
  { path: 'mfa', component: MfaComponent, data: { title: 'Verify'} },
  { path: 'verify', component: VerifyComponent, data: { title: 'Verify'} },
  { path: 'verify/:email/:code', component: VerifyComponent, data: { title: 'Verify'} },
  { path: 'forgot', component: ForgotPasswordComponent, data: { title: 'Forgot Password'} },
  { path: 'terms', component: TermsComponent, data: { title: 'Terms'} },
  { path: 'reset/:accountId/:token', component: ResetPasswordComponent, data: { title: 'Reset Password'} },
  { path: 'reset_password/:accountId/:token', redirectTo: 'reset/:accountId/:token', pathMatch: 'full'},
  { path: '**', redirectTo: 'login'}
];

const routes: Routes = [
  {
    path: '',
    canActivate: [ AuthGuard ],
    component: AuthComponent,
    children: childRoutes
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    LoginComponent,
    AuthComponent,
    MfaComponent,
    VerifyComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  providers: [
    ShareInviteResolveService
  ]
})
export class AuthRoutingModule { }
