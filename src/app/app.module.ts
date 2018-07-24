import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from '@root/app/app.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { MessageComponent } from '@shared/components/message/message.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

const routes: Routes = [
  { path: '', loadChildren: './core/core.module#CoreModule' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mfa', component: MfaComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MfaComponent,
    VerifyComponent,
    SignupComponent,
    MessageComponent,
    LogoComponent,
    ForgotPasswordComponent,
    FormInputComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
