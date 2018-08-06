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
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full'  },
  { path: 'signup', redirectTo: 'auth/signup', pathMatch: 'full'  },
  { path: 'mfa', redirectTo: 'auth/mfa', pathMatch: 'full'  },
  { path: 'verify', redirectTo: 'auth/verify', pathMatch: 'full'  },
  { path: 'forgot', redirectTo: 'auth/forgot', pathMatch: 'full'  },
  { path: 'signupEmbed', redirectTo: 'embed/signup', pathMatch: 'full'  },
  { path: 'verifyEmbed', redirectTo: 'embed/verify', pathMatch: 'full'  },
  { path: 'auth', loadChildren: '@auth/auth.module#AuthModule' },
  { path: 'embed', loadChildren: '@embed/embed.module#EmbedModule' },
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
  ],
  exports: [
  ]
})
export class AppRoutingModule { }
