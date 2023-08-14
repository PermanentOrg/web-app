/* @format */
import { Injectable, EventEmitter } from '@angular/core';
import { map, min } from 'rxjs/operators';
import { find, debounce } from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ArchiveVO, AccountVO, FolderVO } from '@root/app/models';
import {
  AuthResponse,
  AccountResponse,
  ArchiveResponse,
  FolderResponse,
} from '@shared/services/api/index.repo';
import { Router } from '@angular/router';
import { Dialog } from '@root/app/dialog/dialog.module';
import {
  AccessRole,
  AccessRoleType,
  checkMinimumAccess,
} from '@models/access-role';
import * as Sentry from '@sentry/browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { MixpanelService } from '../mixpanel/mixpanel.service';

const ACCOUNT_KEY = 'account';
const ARCHIVE_KEY = 'archive';
const ROOT_KEY = 'root';
const INVITE_KEY = 'INVITE_CODE';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private account: AccountVO;
  private archive: ArchiveVO;
  private rootFolder: FolderVO;
  private skipSessionCheck: boolean;

  private redirectPath: string[] = null;
  private redirectParams: any = null;

  private archives: ArchiveVO[] = [];
  public inviteCode: string;

  public archiveChange: EventEmitter<ArchiveVO> = new EventEmitter();
  public accountChange: EventEmitter<AccountVO> = new EventEmitter();

  public refreshAccountDebounced = debounce(() => {
    this.refreshAccount();
  }, 5000);

<<<<<<< HEAD
  public createAccountForMe: BehaviorSubject<{ name: string; action: string }> =
    new BehaviorSubject<{ name: string; action: string }>({
      name: null,
      action: null,
    });
  createAccountForMe$: Observable<{ name: string; action: string }> =
    this.createAccountForMe.asObservable();
=======
  public createAccountForMe: BehaviorSubject<ArchiveVO> = new BehaviorSubject<ArchiveVO>(new ArchiveVO({}));
  createAccountForMe$: Observable<{}> = this.createAccountForMe.asObservable();
>>>>>>> 87690145 (Create new onboarding flow)

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private cookies: CookieService,
    private dialog: Dialog,
    private router: Router,
    private httpv2: HttpV2Service,
    private mixpanel: MixpanelService
  ) {
    const cachedAccount = this.getStorage(ACCOUNT_KEY);

    const cachedArchive = this.getStorage(ARCHIVE_KEY);

    const cachedRoot = this.storage.local.get(ROOT_KEY);
    this.inviteCode = this.storage.session.get(INVITE_KEY);

    if (cachedAccount) {
      this.setAccount(new AccountVO(cachedAccount));
      this.refreshAccount();
    }

    if (cachedArchive) {
      this.setArchive(new ArchiveVO(cachedArchive));
      this.refreshArchive();
    }

    if (cachedRoot) {
      this.setRootFolder(new FolderVO(cachedRoot));
      this.refreshRoot();
    }

    this.httpv2.tokenExpired.subscribe(() => {
      this.logOut().then(() => {
        window.location.reload();
      });
    });
  }

  public setAccount(newAccount: AccountVO) {
    this.account = newAccount;

    this.setStorage(this.account?.keepLoggedIn, ACCOUNT_KEY, this.account);

    // set account data on Sentry scope
    Sentry.configureScope((scope) => {
      scope.setUser({ id: this.account.accountId });
    });

    // set account data on mixpanel
    this.mixpanel.identify(newAccount);
  }

  public setArchive(newArchive: ArchiveVO) {
    this.archive = newArchive;
    this.setStorage(this.account?.keepLoggedIn, ARCHIVE_KEY, this.archive);

    // set archive data as 'archive' context on Sentry scope
    Sentry.configureScope((scope) => {
      scope.setContext('archive', {
        archiveNbr: newArchive.archiveNbr,
        archiveId: newArchive.archiveId,
      });
    });
  }

  public setArchives(newArchives: ArchiveVO[] = []) {
    while (this.archives.length) {
      this.archives.shift();
    }

    for (const newArchive of newArchives) {
      this.archives.push(newArchive);
    }
  }

  public getAccount() {
    return this.account;
  }

  public getArchive() {
    return this.archive;
  }

  public getArchives() {
    return this.archives;
  }

  public getRootFolder() {
    return this.rootFolder;
  }

  public clearAccount() {
    this.account = undefined;
    this.storage.local.delete(ACCOUNT_KEY);
    this.setArchives();
  }

  public clearArchive() {
    this.archive = undefined;
    this.storage.local.delete(ARCHIVE_KEY);
  }

  public setRootFolder(rootFolder: FolderVO) {
    this.rootFolder = rootFolder;
    this.storage.local.set(ROOT_KEY, rootFolder);
  }

  public clearRootFolder() {
    this.rootFolder = undefined;
    this.storage.local.delete(ROOT_KEY);
  }

  public clear() {
    this.clearAccount();
    this.clearArchive();
    this.clearRootFolder();

    Sentry.configureScope((scope) => {
      scope.setUser(null);
      scope.setContext('archive', null);
    });
  }

  public getPrivateRoot() {
    return find(this.rootFolder.ChildItemVOs, {
      type: 'type.folder.root.private',
    }) as FolderVO;
  }

  public getPublicRoot() {
    return find(this.rootFolder.ChildItemVOs, {
      type: 'type.folder.root.public',
    }) as FolderVO;
  }

  public refreshAccount() {
    return this.api.account
      .get(this.account)
      .then(async (response: AccountResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }
        // Verify that server agrees that the user is logged in
        try {
          const loggedIn = await this.checkSession();
          if (loggedIn) {
            const newArchive = response.getArchiveVO();
            this.archive.update(newArchive);
            if (this.account.keepLoggedIn) {
              this.storage.local.set(ARCHIVE_KEY, this.archive);
            } else {
              this.storage.session.set(ARCHIVE_KEY, this.archive);
            }
          } else {
            throw loggedIn;
          }
        } catch {
          this.logOut();
          this.clear();
          this.router.navigate(['/login']);
        }
      })
      .catch(() => {
        this.logOut();
        this.clear();
        this.router.navigate(['/login']);
      });
  }

  public refreshArchive() {
    if (!this.archive) {
      return Promise.resolve();
    }

    return this.api.archive
      .get([this.archive])
      .then((response: ArchiveResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }
        const newArchive = response.getArchiveVO();
        this.archive.update(newArchive);
        this.storage.local.set(ARCHIVE_KEY, this.archive);
      })
      .catch((response: ArchiveResponse | any) => {
        this.logOut();
        this.clear();
        this.router.navigate(['/login']);
      });
  }

  public refreshArchives() {
    return this.api.archive
      .getAllArchives(this.account)
      .then((response: ArchiveResponse) => {
        const archives = response.getArchiveVOs();
        this.setArchives(archives);
        return this.getArchives();
      });
  }

  public async hasOwnArchives() {
    const archives = await this.refreshArchives();
    const ownArchives = archives.filter((archive) => !archive.isPending());
    return ownArchives.length > 0;
  }

  public async refreshRoot() {
    const response = await this.api.folder.getRoot();
    const root = response.getFolderVO();
    this.setRootFolder(root);
  }

  public updateAccount(accountChanges: AccountVO) {
    const updated = new AccountVO(this.account);
    updated.update(accountChanges);

    return this.api.account
      .update(updated)
      .then((response: AccountResponse) => {
        const newAccount = response.getAccountVO();
        this.account.update(newAccount);
        this.storage.local.set(ACCOUNT_KEY, this.account);
      });
  }

  public changeArchive(archive: ArchiveVO) {
    return this.api.archive
      .change(archive)
      .then((response: ArchiveResponse) => {
        archive = response.getArchiveVO();
        this.setArchive(archive);
      })
      .then(() => {
        return this.api.folder.getRoot();
      })
      .then((response: FolderResponse) => {
        const root = response.getFolderVO();
        this.setRootFolder(root);
        this.archiveChange.emit(this.archive);
        return this.getArchive();
      });
  }

  public checkSession(): Promise<boolean> {
    if (this.skipSessionCheck) {
      this.skipSessionCheck = false;
      return Promise.resolve(true);
    }

    return this.api.auth.isLoggedIn().then((response: AuthResponse) => {
      if (!response.isSuccessful) {
        throw response;
      }
      return response.getSimpleVO().value;
    });
  }

  public isLoggedIn(): boolean {
    return !!this.account && !!this.archive;
  }

  public isEmailOrPhoneUnverified(): boolean {
    return (
      this.account?.emailStatus === 'status.auth.unverified' ||
      this.account?.phoneStatus === 'status.auth.unverified'
    );
  }

  public logIn(
    email: string,
    password: string,
    rememberMe: boolean,
    keepLoggedIn: boolean
  ): Promise<any> {
    this.skipSessionCheck = false;

    if (rememberMe) {
      this.cookies.set('rememberMe', email);
    } else {
      if (this.cookies.check('rememberMe')) {
        this.cookies.delete('rememberMe');
      }
    }

    const currentAccount = this.account;

    return this.api.auth
      .logIn(email, password, rememberMe, keepLoggedIn)
      .pipe(
        map((response: AuthResponse) => {
          if (response.isSuccessful) {
            const newAccount = response.getAccountVO();
            if (
              currentAccount &&
              newAccount.accountId === currentAccount.accountId
            ) {
              newAccount.isNew = currentAccount.isNew;
            }
            this.setAccount(newAccount);
            if (response.getArchiveVO()?.archiveId) {
              this.setArchive(response.getArchiveVO());
            }
            this.skipSessionCheck = true;

            const authToken = response.getAuthToken()?.value;
            if (authToken) {
              this.api.auth.httpV2.setAuthToken(authToken);
            }

            this.accountChange.emit(this.account);
          } else if (response.needsMFA() || response.needsVerification()) {
            this.setAccount(new AccountVO({ primaryEmail: email }));
          } else {
            throw response;
          }
          return response;
        })
      )
      .toPromise();
  }

  public checkForMFAWithLogin(oldPassword: string): Promise<AuthResponse> {
    return this.api.auth
      .logIn(
        this.account.primaryEmail,
        oldPassword,
        this.account.rememberMe,
        this.account.keepLoggedIn
      )
      .toPromise();
  }

  public logOut(): Promise<AuthResponse> {
    return this.api.auth
      .logOut()
      .pipe(
        map((response: AuthResponse) => {
          if (response.isSuccessful) {
            this.clearAccount();
            this.clearArchive();
            this.clearRootFolder();

            this.accountChange.emit(null);
          }

          return response;
        })
      )
      .toPromise();
  }

  public verifyMfa(
    token: string,
    keepLoggedIn?: boolean
  ): Promise<AuthResponse> {
    return this.api.auth
      .verify(this.account, token, 'type.auth.mfaValidation')
      .pipe(
        map((response: AuthResponse) => {
          if (response.isSuccessful) {
            const newAccount = new AccountVO({
              ...response.getAccountVO(),
              keepLoggedIn,
            });
            this.setAccount(newAccount);

            const authToken = response.getAuthToken()?.value;
            if (authToken) {
              this.api.auth.httpV2.setAuthToken(authToken);
            }

            this.accountChange.emit(this.account);
            return response;
          } else {
            throw response;
          }
        })
      )
      .toPromise();
  }

  public verifyEmail(token: string): Promise<AuthResponse> {
    return this.api.auth
      .verify(this.account, token, 'type.auth.email')
      .pipe(
        map((response: AuthResponse) => {
          if (response.isSuccessful) {
            this.setAccount(response.getAccountVO());
            return response;
          } else {
            throw response;
          }
        })
      )
      .toPromise();
  }

  public verifyPhone(token: string): Promise<AuthResponse> {
    return this.api.auth
      .verify(this.account, token, 'type.auth.phone')
      .pipe(
        map((response: AuthResponse) => {
          if (response.isSuccessful) {
            this.setAccount(response.getAccountVO());
            return response;
          } else {
            throw response;
          }
        })
      )
      .toPromise();
  }

  public resendEmailVerification(): Promise<AuthResponse> {
    return this.api.auth.resendEmailVerification(this.account);
  }

  public resendPhoneVerification(): Promise<AuthResponse> {
    return this.api.auth.resendPhoneVerification(this.account);
  }

  public switchToDefaultArchive(): Promise<ArchiveResponse> {
    return this.api.archive
      .getAllArchives(this.account)
      .then((response: ArchiveResponse) => {
        const archives = response.getArchiveVOs();
        const defaultArchiveData = find(archives, {
          archiveId: this.account.defaultArchiveId,
        });
        this.setArchive(new ArchiveVO(defaultArchiveData));
        this.archiveChange.emit(this.archive);
        return response;
      });
  }

  public checkMinimumAccess(
    itemAccessRole: AccessRoleType,
    minimumAccess: AccessRole
  ) {
    return (
      this.checkMinimumArchiveAccess(minimumAccess) &&
      checkMinimumAccess(itemAccessRole, minimumAccess)
    );
  }

  public checkMinimumArchiveAccess(minimumAccess: AccessRole) {
    return (
      this.archive &&
      this.isLoggedIn() &&
      checkMinimumAccess(this.archive.accessRole, minimumAccess)
    );
  }

  public async signUp(
    email: string,
    fullName: string,
    password: string,
    passwordConfirm: string,
    agreed: boolean,
    optIn: boolean,
    phone: string,
    inviteCode: string,
    createDefaultArchive: boolean
  ): Promise<AccountVO> {
    this.skipSessionCheck = false;

    if (this.isLoggedIn()) {
      try {
        await this.logOut();
      } catch (err) { }
    }

    this.inviteCode = inviteCode;
    this.storage.session.set(INVITE_KEY, inviteCode);

    try {
      return this.api.account
        .signUp(
          email,
          fullName,
          password,
          passwordConfirm,
          agreed,
          optIn,
          createDefaultArchive,
          phone,
          inviteCode
        )
        .pipe(
          map((response: AccountVO) => {
            const newAccount = response;
            newAccount.isNew = true;
            this.setAccount(newAccount);
            this.mixpanel.track('Sign up', { accountId: newAccount.accountId });
            return newAccount;
          })
        )
        .toPromise();
    } catch (err) {
      return new Promise((resolve, reject) => reject(err));
    }
  }

  public setRedirect(path: string[], params?: any) {
    this.redirectPath = path;
    this.redirectParams = params;
  }

  public clearRedirect() {
    this.redirectPath = null;
    this.redirectParams = null;
  }

  public goToRedirect() {
    if (this.redirectPath) {
      this.router.navigate(this.redirectPath, this.redirectParams);
    }

    this.clearRedirect();
  }

  public hasRedirect() {
    return !!this.redirectPath;
  }

  public async promptForArchiveChange(promptText = 'Choose archive:') {
    await this.refreshArchives();
    if (this.archives.length > 1) {
      return this.dialog.open(
        'ArchiveSwitcherDialogComponent',
        { promptText },
        { height: 'auto', width: 'fullscreen' }
      );
    }
  }

  private setStorage(keepLoggedIn: boolean, key: string, value: any) {
    if (keepLoggedIn) {
      this.storage.local.set(key, value);
    } else {
      this.storage.session.set(key, value);
    }
  }

  private getStorage(key) {
    return this.storage.local.get(key) || this.storage.session.get(key);
  }
}
