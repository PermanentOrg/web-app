/* @format */
import { CookieService } from 'ngx-cookie-service';
import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Shallow } from 'shallow-render';
import { Observable } from 'rxjs';
import { UploadService } from '@core/services/upload/upload.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { AccountVO, ArchiveVO, FolderVO, RecordVO } from '@root/app/models';
import { AppModule } from '../../../../app.module';
import { StorageService } from '../../storage/storage.service';
import { EditService } from '../../../../core/services/edit/edit.service';

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
          logIn: (
            email: string,
            password: string,
            rememberMe: boolean,
            keepLoggedIn: boolean
          ) => {
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
      })
      .mock(UploadService, {
        uploadFiles: (parentFolder: FolderVO, files: File[]) => {
          return Promise.resolve(true);
        },
      })
      .mock(EditService, {
        deleteItems: (items: any[]) => Promise.resolve(true),
      })
      .mock(CookieService, { set: (key: string, value: string) => {} });
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
    const trackerSpy = spyOn(instance, 'trackAuthWithMixpanel');

    const account = new AccountVO({
      primaryEmail: 'test@permanent.org',
      fullName: 'Test User',
      keepLoggedIn: true,
      emailStatus: 'status.auth.unverified',
    });

    instance.setAccount(account);

    await instance.verifyEmail('sampleToken');
    expect(instance.getAccount().emailStatus).toBe('status.auth.verified');
    expect(instance.getAccount().keepLoggedIn).toBeTrue();
    expect(trackerSpy).toHaveBeenCalled();
  });

  it('should handle successful phone verification', async () => {
    const { instance } = shallow.createService();
    const trackerSpy = spyOn(instance, 'trackAuthWithMixpanel');

    const account = new AccountVO({
      primaryEmail: 'test@permanent.org',
      fullName: 'Test User',
      keepLoggedIn: true,
      phoneStatus: 'status.auth.unverified',
    });

    instance.setAccount(account);

    await instance.verifyEmail('sampleToken');
    expect(instance.getAccount().phoneStatus).toBe('status.auth.verified');
    expect(instance.getAccount().keepLoggedIn).toBeTrue();
    expect(trackerSpy).toHaveBeenCalled();
  });
  it('should update the account storage when a file is uploaded successfully', async () => {
    const { instance, inject } = shallow.createService();
    const uploadService = inject(UploadService);
    const account = new AccountVO({
      spaceLeft: 100000,
    });
    instance.setAccount(account);

    await uploadService.uploadFiles(new FolderVO({}), [
      new File([], 'test.txt'),
    ]);
    await instance.deductAccountStorage(200);
    expect(instance.getAccount().spaceLeft).toEqual(99800);
  });

  it('should send the account data to mixpanel after signing up', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
    const trackerSpy = spyOn(instance, 'trackAuthWithMixpanel');
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

    expect(trackerSpy).toHaveBeenCalled();
  });

  it('should send the account data to mixpanel after logging in', async () => {
    const { instance, inject } = shallow.createService();
    const apiService = inject(ApiService);
    const trackerSpy = spyOn(instance, 'trackAuthWithMixpanel');
    const account = await instance.logIn(
      'test@permanent.org',
      'password123',
      true,
      true
    );

    expect(trackerSpy).toHaveBeenCalled();
  });
  it('should add storage back after deleting an item', async () => {
    const { instance, inject } = shallow.createService();
    const editService = inject(EditService);
    const account = new AccountVO({
      spaceLeft: 100000,
    });

    const itemsToDelete = [
      new RecordVO({ size: 100 }),
      new RecordVO({ size: 300 }),
    ];

    const sizeOfItemsToDelete = itemsToDelete.reduce(
      (acc, item) => acc + item.size,
      0
    );

    instance.setAccount(account);
    await editService.deleteItems(itemsToDelete);

    await instance.deductAccountStorage(-sizeOfItemsToDelete);

    expect(instance.getAccount().spaceLeft).toEqual(100400);
  });
});
