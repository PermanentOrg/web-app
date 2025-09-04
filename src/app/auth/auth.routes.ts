import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RecaptchaModule } from 'ng-recaptcha-2';

import { SharedModule } from '@shared/shared.module';

import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { PasswordStrengthComponent } from '@auth/components/password-strength/password-strength';
import { AnnouncementModule } from '../announcement/announcement.module';
import { ComponentsModule } from '../component-library/components.module';
import { AuthComponent } from './components/auth/auth.component';
import { ShareInviteResolveService } from './resolves/share-invite-resolve.service';
import { OrDividerComponent } from './components/or-divider/or-divider.component';

import { AuthGuard } from './guards/auth.guard';

const unauthenticatedRoutes: Routes = [
	{ path: 'login', component: LoginComponent, data: { title: 'Log In' } },
	{
		path: 'signup',
		component: SignupComponent,
		data: { title: 'Sign Up' },
		resolve: { shareInviteData: ShareInviteResolveService },
	},
	{ path: 'mfa', component: MfaComponent, data: { title: 'Verify' } },
	{
		path: 'forgot',
		component: ForgotPasswordComponent,
		data: { title: 'Forgot Password' },
	},
	{ path: '**', redirectTo: 'login' },
];

const verifyRoutes: Routes = [
	{ path: '', component: VerifyComponent, data: { title: 'Verify' } },
	{
		path: ':email/:code',
		component: VerifyComponent,
		data: { title: 'Verify' },
	},
];

const routes: Routes = [
	{
		path: 'verify',
		component: AuthComponent,
		children: verifyRoutes,
	},
	{
		path: '',
		canActivate: [AuthGuard],
		component: AuthComponent,
		children: unauthenticatedRoutes,
	},
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		FontAwesomeModule,
		SharedModule,
		AnnouncementModule,
		RecaptchaModule,
		ComponentsModule,
	],
	declarations: [
		LoginComponent,
		AuthComponent,
		MfaComponent,
		VerifyComponent,
		SignupComponent,
		ForgotPasswordComponent,
		OrDividerComponent,
		PasswordStrengthComponent,
	],
	providers: [ShareInviteResolveService],
})
export class AuthRoutingModule {}
