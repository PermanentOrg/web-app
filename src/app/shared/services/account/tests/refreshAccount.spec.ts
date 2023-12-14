/* @format */
import { Shallow } from 'shallow-render';
import { AccountVO } from '@models/account-vo';
import { Observable, Subject } from 'rxjs';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { AppModule } from '@root/app/app.module';
import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { Router } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { AccountResponse } from '@shared/services/api/account.repo';
import { LocationStrategy } from '@angular/common';
import { AccountService } from '../account.service';

class AccountRepoStub {
  public static failRequest: boolean = false;
  public async get(_account: AccountVO) {
    if (AccountRepoStub.failRequest) {
      throw 'test error';
    }
    return new AccountResponse({
      isSuccessful: true,
      Results: [
        {
          data: [
            {
              AccountVO: {
                primaryEmail: 'test@permanent.org',
                fullName: 'Test User',
              },
              ArchiveVO: {
                archiveNbr: '0001-0000',
              },
            },
          ],
        },
      ],
    });
  }
}

class AuthRepoStub {
  public static loggedIn: boolean = true;

  public logOut() {
    return new Observable<AuthResponse>();
  }

  public async isLoggedIn() {
    return new AuthResponse({
      isSuccessful: true,
      Results: [
        {
          data: [
            {
              SimpleVO: {
                key: 'bool',
                value: AuthRepoStub.loggedIn,
                createdDT: null,
                updatedDT: null,
              },
            },
          ],
        },
      ],
    });
  }
}

const dummyStorageService = {
  local: {
    get: () => {},
    set: () => {},
    delete: () => {},
  },
  session: {
    get: () => {},
    set: () => {},
    delete: () => {},
  },
};

describe('AccountService: refreshAccount', () => {
  let shallow: Shallow<AccountService>;
  let accountRepo: AccountRepoStub;
  let authRepo: AuthRepoStub;

  beforeEach(() => {
    AuthRepoStub.loggedIn = true;
    AccountRepoStub.failRequest = false;
    accountRepo = new AccountRepoStub();
    authRepo = new AuthRepoStub();
    shallow = new Shallow(AccountService, AppModule)
      .dontMock(ApiService)
      .provide({
        provide: ApiService,
        useValue: { auth: authRepo, account: accountRepo },
      })
      .mock(StorageService, dummyStorageService);
  });

  function setUpSpies(
    services: {
      apiService: ApiService;
      router: Router;
      location: LocationStrategy;
      instance: AccountService;
    },
    url: string = '/app/private'
  ) {
    services.router.navigate = jasmine
      .createSpy('router.navigate')
      .and.callFake(() => {});

    const logOutSpy = spyOn(
      services.apiService.auth,
      'logOut'
    ).and.callThrough();
    spyOn(services.location, 'path').and.returnValue(url);

    services.instance.setArchive(new ArchiveVO({}));
    services.instance.setAccount(new AccountVO({}));

    return { logOutSpy };
  }
  it('should be able to check if the user is logged in', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies({
      apiService: inject(ApiService),
      router,
      location: inject(LocationStrategy),
      instance,
    });

    await instance.refreshAccount();
    expect(logOutSpy).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should redirect the user to the login page if their session expires', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies({
      apiService: inject(ApiService),
      router,
      location: inject(LocationStrategy),
      instance,
    });

    AuthRepoStub.loggedIn = false;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('should not redirect the user to login page if their session expires on a public archive', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies(
      {
        apiService: inject(ApiService),
        router,
        location: inject(LocationStrategy),
        instance,
      },
      '///p/0001-0000/?ksljflkasjlf'
    );

    AuthRepoStub.loggedIn = false;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should not redirect the user to login page if their session expires in the public gallery', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies(
      {
        apiService: inject(ApiService),
        router,
        location: inject(LocationStrategy),
        instance,
      },
      '///gallery/////'
    );

    AuthRepoStub.loggedIn = false;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should redirect the user if the account/get call fails', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies({
      apiService: inject(ApiService),
      router,
      location: inject(LocationStrategy),
      instance,
    });

    AccountRepoStub.failRequest = true;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('should not redirect the user if the account/get call fails on the public archive', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies(
      {
        apiService: inject(ApiService),
        router,
        location: inject(LocationStrategy),
        instance,
      },
      '/p/0001-0000/'
    );

    AccountRepoStub.failRequest = true;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should not redirect the user if the account/get call fails on the public gallery', async () => {
    const { instance, inject } = shallow.createService();
    const router = inject(Router);

    const { logOutSpy } = setUpSpies(
      {
        apiService: inject(ApiService),
        router,
        location: inject(LocationStrategy),
        instance,
      },
      '/gallery/'
    );

    AccountRepoStub.failRequest = true;
    await instance.refreshAccount();
    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
