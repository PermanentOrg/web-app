/* @format */
import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Shallow } from 'shallow-render';
import { Observable } from 'rxjs';

import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { AccountVO, ArchiveVO } from '@root/app/models';
import { AppModule } from '../../../app.module';
import { StorageService } from '../storage/storage.service';

describe('AccountService', () => {
  let shallow: Shallow<AccountService>;

  beforeEach(() => {
    shallow = new Shallow(AccountService, AppModule)
      .mock(ApiService, {
        account: {
          signUp: (
            email: string,
            fullName: string,
            password: string,
            passwordConfirm: string,
            agreed: boolean,
            optIn: boolean,
            createDefaultArchive: boolean,
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
        auth: {
          verify: (account, token, type) => {
            return new Observable((observer) => {
              observer.next(
                new AuthResponse({
                  isSuccessful: true,
                  Results: [
                    {
                      data: [
                        {
                          AccountVO: {
                            primaryEmail: 'test@permanent.org',
                            fullName: 'Test User',
                            emailStatus: 'status.auth.verified',
                            phoneStatus: 'status.auth.verified',
                          },
                        },
                      ],
                    },
                  ],
                })
              );
              observer.complete();
            });
          },
        },
      })
      .mock(Router, {
        navigate: (route: string[]) => Promise.resolve(true),
      })
      .mock(StorageService, {
        local: {
          get: () => {},
          set: () => {},
        },
        session: {
          get: () => {},
          set: () => {},
        },
      });
  });

  it('should be created', () => {
    const { instance } = shallow.createService();
    expect(instance).toBeTruthy();
  });

  it('should make the correct API calls during signUp', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
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
    expect(account.primaryEmail).toEqual('test@permanent.org');
  });

  it('should pass along errors encountered during signUp', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
    const expectedError = 'Out of cheese error. Redo from start';
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

  it('should handle successful email verification', async () => {
    const { instance } = shallow.createService();

    const account = new AccountVO({
      primaryEmail: 'test@permanent.org',
      fullName: 'Test User',
      keepLoggedIn: true,
      emailStatus: 'status.auth.unverified',
    });

    instance.setAccount(account);

    await instance.verifyEmail('sampleToken');
    expect(instance.getAccount().emailStatus).toBe('status.auth.verified');
  });

  it('should handle successful phone verification', async () => {
    const { instance } = shallow.createService();

    const account = new AccountVO({
      primaryEmail: 'test@permanent.org',
      fullName: 'Test User',
      keepLoggedIn: true,
      phoneStatus: 'status.auth.unverified',
    });

    instance.setAccount(account);

    await instance.verifyEmail('sampleToken');
    expect(instance.getAccount().phoneStatus).toBe('status.auth.verified');
  });
});
