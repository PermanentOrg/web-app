import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';

import { SignupEmbedComponent } from '@embed/components/signup-embed/signup-embed.component';
import { DoneEmbedComponent } from '@embed/components/done-embed/done-embed.component';
import { VerifyEmbedComponent } from '@embed/components/verify-embed/verify-embed.component';
import { NewsletterSignupComponent } from './components/newsletter-signup/newsletter-signup.component';
import { LoginEmbedComponent } from './components/login-embed/login-embed.component';
import { MfaEmbedComponent } from './components/mfa-embed/mfa-embed.component';
import { ForgotPasswordEmbedComponent } from './components/forgot-password-embed/forgot-password-embed.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  declarations: [
    LoginEmbedComponent,
    SignupEmbedComponent,
    DoneEmbedComponent,
    VerifyEmbedComponent,
    MfaEmbedComponent,
    NewsletterSignupComponent,
    ForgotPasswordEmbedComponent
  ],
  exports: [
    LoginEmbedComponent,
    SignupEmbedComponent,
    DoneEmbedComponent,
    VerifyEmbedComponent,
    MfaEmbedComponent,
    NewsletterSignupComponent,
    ForgotPasswordEmbedComponent
  ]
})
export class EmbedComponentsModule { }
