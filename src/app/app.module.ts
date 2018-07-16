import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/components/login/login.component';
import { MessageComponent } from './shared/components/message/message.component';
import { MfaComponent } from './auth/components/mfa/mfa.component';
import { VerifyComponent } from './auth/components/verify/verify.component';
import { SignupComponent } from './auth/components/signup/signup.component';
import { LogoComponent } from './auth/components/logo/logo.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mfa', component: MfaComponent },
  { path: 'app', loadChildren: './core/core.module#CoreModule' },
  { path: '**', redirectTo: 'app', pathMatch: 'full' },
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
