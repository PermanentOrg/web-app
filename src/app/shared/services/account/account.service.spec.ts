/* @format */
import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Shallow } from 'shallow-render';
import { Observable } from 'rxjs';

import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { CreateCredentialsResponse } from '@shared/services/api/auth.repo';
import { AppModule } from '../../../app.module';
import { AccountVO, ArchiveVO } from '@root/app/models';

describe('AccountService', () => {
  let shallow: Shallow<AccountService>;

  beforeEach(() => {
    shallow = new Shallow(AccountService, AppModule)
      .mock(ApiService, {
        auth: {
          createCredentials: (
            fullName: string,
            email: string,
            password: string,
            passwordConfirm: string,
            phone?: string
          ) => Promise.resolve({ user: { id: 'test-subject' } }),
          logOut: () =>
            new Observable((observer) => {
              observer.next(new AuthResponse({ isSuccessful: true }));
              observer.complete();
            }),
        },
        account: {
          signUp: (
            email: string,
            fullName: string,
            agreed: boolean,
            optIn: boolean,
            createDefaultArchive: boolean,
            subject: string,
            phone?: string,
            inviteCode?: string
          ) => {
            return new Observable((observer) => {
              observer.next(
                new AccountVO({
                  primaryEmail: 'test@permanent.org',
                  fullName: 'Test User',
                })
              );
              observer.complete();
            });
          },
          get: (account: AccountVO) => Promise.reject({}),
        },
      })
      .mock(Router, {
        navigate: (route: string[]) => Promise.resolve(true),
      });
  });

  it('should be created', () => {
    const { instance } = shallow.createService();
    expect(instance).toBeTruthy();
  });

  it('should make the correct API calls during signUp', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
    const authSpy = spyOn(apiService.auth, 'createCredentials').and.returnValue(
      Promise.resolve({ user: { id: 'test-subject' } })
    );
    const account = await instance.signUp(
      'test@permanent.org',
      'Test User',
      'password123',
      'password123',
      true,
      true,
      '',
      '',
      true
    );
    expect(authSpy).toHaveBeenCalled();
    expect(account.primaryEmail).toEqual('test@permanent.org');
  });

  it('should pass along errors encountered during signUp', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
    const expectedError = 'Out of cheese error. Redo from start';
    const authSpy = spyOn(apiService.auth, 'createCredentials').and.returnValue(
      Promise.reject(expectedError)
    );
    try {
      await instance.signUp(
        'test@permanent.org',
        'Test User',
        'password123',
        'password123',
        true,
        true,
        '',
        '',
        true
      );
    } catch (error) {
      expect(error).toEqual(expectedError);
    }
  });
});
