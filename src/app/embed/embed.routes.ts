import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';
import { EmbedComponentsModule } from './embed-components.module';

import { SignupEmbedComponent } from '@embed/components/signup-embed/signup-embed.component';
import { DoneEmbedComponent } from '@embed/components/done-embed/done-embed.component';
import { VerifyEmbedComponent } from '@embed/components/verify-embed/verify-embed.component';
import { NewsletterSignupComponent } from './components/newsletter-signup/newsletter-signup.component';
import { LoginEmbedComponent } from './components/login-embed/login-embed.component';
import { MfaEmbedComponent } from './components/mfa-embed/mfa-embed.component';
import { ForgotPasswordEmbedComponent } from './components/forgot-password-embed/forgot-password-embed.component';

export const routes: Routes = [
  { path: 'login', component: LoginEmbedComponent},
  { path: 'signup', component: SignupEmbedComponent },
  { path: 'verify', component: VerifyEmbedComponent },
  { path: 'mfa', component: MfaEmbedComponent },
  { path: 'done', component: DoneEmbedComponent },
  { path: 'forgot', component: ForgotPasswordEmbedComponent },
  { path: 'newsletterSignup', component: NewsletterSignupComponent },
  { path: '**', redirectTo: 'signup'}
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    EmbedComponentsModule,
    SharedModule
  ],
})
export class EmbedRoutingModule { }

