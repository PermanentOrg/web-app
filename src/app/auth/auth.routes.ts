import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { AuthComponent } from './components/auth/auth.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { TermsComponent } from '@shared/components/terms/terms.component';
import { ShareInviteResolveService } from './resolves/share-invite-resolve.service';

import { AuthGuard } from './guards/auth.guard';
import { AnnouncementModule } from '../announcement/announcement.module';

const unauthenticatedRoutes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: 'Log In' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Sign Up' }, resolve: { shareInviteData: ShareInviteResolveService }},
  { path: 'mfa', component: MfaComponent, data: { title: 'Verify'} },
  { path: 'forgot', component: ForgotPasswordComponent, data: { title: 'Forgot Password'} },
  { path: 'terms', component: TermsComponent, data: { title: 'Terms'} },
  { path: '**', redirectTo: 'login'}
];

const verifyRoutes: Routes = [
  { path: '', component: VerifyComponent, data: { title: 'Verify'} },
  { path: '/:email/:code', component: VerifyComponent, data: { title: 'Verify'} },
];

const routes: Routes = [
  {
    path: 'verify',
    component: AuthComponent,
    children: verifyRoutes,
  },
  {
    path: '',
    canActivate: [ AuthGuard ],
    component: AuthComponent,
    children: unauthenticatedRoutes,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    AnnouncementModule,
  ],
  declarations: [
    LoginComponent,
    AuthComponent,
    MfaComponent,
    VerifyComponent,
    SignupComponent,
    ForgotPasswordComponent,
  ],
  providers: [
    ShareInviteResolveService
  ]
})
export class AuthRoutingModule { }
