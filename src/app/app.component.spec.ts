import { TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { MessageComponent } from '@shared/components/message/message.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { VerifyComponent } from '@auth/components/verify/verify.component';
import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        AppComponent,
        MessageComponent,
        LogoComponent,
        LoginComponent,
        SignupComponent,
        VerifyComponent,
        ForgotPasswordComponent,
        MfaComponent
      ],
      providers: [
        CookieService
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
