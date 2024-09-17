/* @format */
import { NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Shallow } from 'shallow-render';
import { LoginComponent } from '@auth/components/login/login.component';
import { MessageService } from '@shared/services/message/message.service';
import { TEST_DATA } from '@core/core.module.spec';
import { AccountService } from '@shared/services/account/account.service';

@NgModule()
class DummyModule {}

class MockAccountService {}

class MockActivatedRoute {}

describe('LoginComponent', () => {
  let shallow: Shallow<LoginComponent>;
  let cookieService: Map<string, string>;

  const testEmail = 'unittest@example.com';

  beforeEach(() => {
    cookieService = new Map<string, string>();
    cookieService.set('rememberMe', testEmail);
    shallow = new Shallow(LoginComponent, DummyModule)
      .provideMock(
        {
          provide: AccountService,
          useClass: MockAccountService,
        },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: CookieService, useValue: cookieService },
      )
      .provide(MessageService);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should autofill with the email from cookies', async () => {
    const { instance } = await shallow.render();

    expect(instance.loginForm.value.email).toEqual(testEmail);
  });

  it('should set error for missing email', async () => {
    const { instance } = await shallow.render();
    instance.loginForm.get('email').markAsTouched();
    instance.loginForm.patchValue({
      email: '',
      password: TEST_DATA.user.password,
    });

    expect(instance.loginForm.invalid).toBeTruthy();
    expect(instance.loginForm.get('email').errors.required).toBeTruthy();
  });

  it('should set error for invalid email', async () => {
    const { instance } = await shallow.render();
    instance.loginForm.get('email').markAsTouched();
    instance.loginForm.patchValue({
      email: 'lasld;f;aslkj',
      password: TEST_DATA.user.password,
    });

    expect(instance.loginForm.invalid).toBeTruthy();
    expect(instance.loginForm.get('email').errors.email).toBeTruthy();
  });

  it('should set error for missing password', async () => {
    const { instance } = await shallow.render();
    instance.loginForm.get('password').markAsTouched();
    instance.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: '',
    });

    expect(instance.loginForm.invalid).toBeTruthy();
    expect(instance.loginForm.get('password').errors.required).toBeTruthy();
  });

  it('should set error for too short password', async () => {
    const { instance } = await shallow.render();
    instance.loginForm.get('password').markAsTouched();
    instance.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: 'short',
    });

    expect(instance.loginForm.invalid).toBeTruthy();
    expect(instance.loginForm.get('password').errors.minlength).toBeTruthy();
  });

  it('should have no errors when email and password valid', async () => {
    const { instance } = await shallow.render();
    instance.loginForm.markAsTouched();
    instance.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password,
    });

    expect(instance.loginForm.valid).toBeTruthy();
  });
});
