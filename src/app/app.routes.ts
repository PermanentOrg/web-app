import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from '@auth/components/login/login.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { SignupEmbedComponent } from '@auth/components/signup-embed/signup-embed.component';
import { DoneEmbedComponent } from '@auth/components/done-embed/done-embed.component';
import { VerifyEmbedComponent } from '@auth/components/verify-embed/verify-embed.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signupEmbed', component: SignupEmbedComponent },
  { path: 'mfa', component: MfaComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'verifyEmbed', component: VerifyEmbedComponent },
  { path: 'doneEmbed', component: DoneEmbedComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: '', loadChildren: '@core/core.module#CoreModule' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {paramsInheritanceStrategy: 'always'}),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    MfaComponent,
    VerifyComponent,
    VerifyEmbedComponent,
    SignupComponent,
    SignupEmbedComponent,
    DoneEmbedComponent,
    ForgotPasswordComponent,
    LogoComponent,
    FormInputComponent
  ],
  exports: [
    LoginComponent,
    MfaComponent,
    VerifyComponent,
    VerifyEmbedComponent,
    SignupComponent,
    SignupEmbedComponent,
    DoneEmbedComponent,
    ForgotPasswordComponent,
    LogoComponent,
    FormInputComponent
  ]
})
export class AppRoutingModule { }
