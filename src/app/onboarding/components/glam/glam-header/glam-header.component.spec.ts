/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import {} from '@angular/common/http/testing';
import { OnboardingModule } from '../../../onboarding.module';
import { GlamOnboardingHeaderComponent } from './glam-header.component';

describe('GlamHeaderComponent', () => {
  let shallow: Shallow<GlamOnboardingHeaderComponent>;

  beforeEach(async () => {
    shallow = new Shallow(GlamOnboardingHeaderComponent, OnboardingModule)
      .import(HttpClientTestingModule)
      .provideMock({ provide: AccountService, useValue: { clear: () => {} } });
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('can log out the user', async () => {
    const { find, inject } = await shallow.render();

    const accountClearSpy = spyOn(inject(AccountService), 'clear').and.callFake(
      () => {},
    );
    const navigateSpy = spyOn(inject(Router), 'navigate').and.resolveTo(true);
    find('.actions .log-out').triggerEventHandler('click');

    expect(accountClearSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();
  });
});
