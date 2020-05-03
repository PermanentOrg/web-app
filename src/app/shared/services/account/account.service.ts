import { Injectable, EventEmitter } from '@angular/core';
import { map, min } from 'rxjs/operators';
import { find } from 'lodash';
import { CookieService } from 'ngx-cookie-service';

import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ArchiveVO, AccountVO, FolderVO } from '@root/app/models';
import { AuthResponse, AccountResponse, ArchiveResponse, FolderResponse } from '@shared/services/api/index.repo';
import { Router } from '@angular/router';
import { Dialog } from '@root/app/dialog/dialog.module';
import { AccessRole } from '@models/access-role.enum';
import { AccessRoleType, checkMinimumAccess } from '@models/access-role';

const ACCOUNT_KEY = 'account';
const ARCHIVE_KEY = 'archive';
const ROOT_KEY = 'root';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private account: AccountVO;
  private archive: ArchiveVO;
  private rootFolder: FolderVO;
  private skipSessionCheck: boolean;

  private redirectPath: string[] = null;
  private redirectParams: any = null;

  private archives: ArchiveVO[] = [];

  public archiveChange: EventEmitter<ArchiveVO> = new EventEmitter();
  public accountChange: EventEmitter<AccountVO> = new EventEmitter();

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private cookies: CookieService,
    private dialog: Dialog,
    private router: Router
  ) {
    const cachedAccount = this.storage.local.get(ACCOUNT_KEY);
    const cachedArchive = this.storage.local.get(ARCHIVE_KEY);
    const cachedRoot = this.storage.local.get(ROOT_KEY);

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
    }
  }

  public setAccount(newAccount: AccountVO) {
    this.account = newAccount;
    this.storage.local.set(ACCOUNT_KEY, this.account);
  }

  public setArchive(newArchive: ArchiveVO) {
    this.archive = newArchive;
    this.storage.local.set(ARCHIVE_KEY, this.archive);
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
  }

  public getPrivateRoot() {
    return find(this.rootFolder.ChildItemVOs, { type: 'type.folder.root.private'});
  }

  public getPublicRoot() {
    return find(this.rootFolder.ChildItemVOs, { type: 'type.folder.root.public'});
  }

  public refreshAccount() {
    return this.api.account.get(this.account)
      .then((response: AccountResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        const newAccount = response.getAccountVO();
        this.account.update(newAccount);
        this.storage.local.set(ACCOUNT_KEY, this.account);
        this.setArchives();
      })
      .catch((response: AccountResponse | any) => {
        this.logOut();
        this.clear();
        this.router.navigate(['/login']);
      });
  }

  public refreshArchive() {
    if (!this.archive) {
      return Promise.resolve();
    }

    return this.api.archive.get([this.archive])
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
    return this.api.archive.getAllArchives(this.account)
      .then((response: ArchiveResponse) => {
        const archives = response.getArchiveVOs();
        this.setArchives(archives);
        return this.getArchives();
      });
  }

  public updateAccount(accountChanges: AccountVO) {
    const updated = new AccountVO(this.account);
    updated.update(accountChanges);

    return this.api.account.update(updated)
      .then((response: AccountResponse) => {
        const newAccount = response.getAccountVO();
        this.account.update(newAccount);
        this.storage.local.set(ACCOUNT_KEY, this.account);
      });
  }

  public changeArchive(archive: ArchiveVO) {
    return this.api.archive.change(archive)
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

    return this.api.auth.isLoggedIn()
      .then((response: AuthResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }
        return response.getSimpleVO().value;
      });
  }

  public isLoggedIn(): boolean {
    return !!this.account && !!this.archive;
  }

  public logIn(email: string, password: string, rememberMe: boolean, keepLoggedIn: boolean): Promise<any> {
    this.skipSessionCheck = false;

    if (rememberMe && this.cookies.check('rememberMe')) {
      this.cookies.set('rememberMe', email);
    }

    const currentAccount = this.account;

    return this.api.auth.logIn(email, password, rememberMe, keepLoggedIn)
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          const newAccount = response.getAccountVO();
          if (currentAccount && newAccount.accountId === currentAccount.accountId) {
            newAccount.isNew = currentAccount.isNew;
          }
          this.setAccount(newAccount);
          this.setArchive(response.getArchiveVO());
          this.skipSessionCheck = true;

          this.accountChange.emit(this.account);
        } else if (response.needsMFA() || response.needsVerification()) {
          this.setAccount(new AccountVO({primaryEmail: email}));
        } else {
          throw response;
        }
        return response;
      })).toPromise();
  }

  public logOut(): Promise<AuthResponse> {
    return this.api.auth.logOut()
      .pipe(map((response: AuthResponse) => {
        if ( response.isSuccessful) {
          this.clearAccount();
          this.clearArchive();
          this.clearRootFolder();

          this.accountChange.emit(null);
        }

        return response;
      })).toPromise();
  }

  public verifyMfa(token: string): Promise<AuthResponse> {
    return this.api.auth.verify(this.account, token, 'type.auth.mfaValidation')
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          this.setArchive(response.getArchiveVO());

          this.accountChange.emit(this.account);
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }

  public verifyEmail(token: string): Promise<AuthResponse> {
    return this.api.auth.verify(this.account, token, 'type.auth.email')
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }

  public verifyPhone(token: string): Promise<AuthResponse> {
    return this.api.auth.verify(this.account, token, 'type.auth.phone')
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }

  public resendEmailVerification(): Promise<AuthResponse> {
    return this.api.auth.resendEmailVerification(this.account);
  }

  public resendPhoneVerification(): Promise<AuthResponse> {
    return this.api.auth.resendPhoneVerification(this.account);
  }

  public switchToDefaultArchive(): Promise<ArchiveResponse> {
    return this.api.archive.getAllArchives(this.account)
      .then((response: ArchiveResponse) => {
        const archives = response.getArchiveVOs();
        const defaultArchiveData = find(archives, {archiveId: this.account.defaultArchiveId});
        this.setArchive(new ArchiveVO(defaultArchiveData));
        this.archiveChange.emit(this.archive);
        return response;
      });
  }

  public checkMinimumAccess(itemAccessRole: AccessRoleType, minimumAccess: AccessRole) {
    return this.checkMinimumArchiveAccess(minimumAccess) && checkMinimumAccess(itemAccessRole, minimumAccess);
  }

  public checkMinimumArchiveAccess(minimumAccess: AccessRole) {
    return this.archive && this.isLoggedIn() && checkMinimumAccess(this.archive.accessRole, minimumAccess);
  }

  public async signUp(
    email: string, fullName: string, password: string, passwordConfirm: string,
    agreed: boolean, optIn: boolean, phone: string, inviteCode: string
  ) {
    this.skipSessionCheck = false;

    if (this.isLoggedIn()) {
      try {
        await this.logOut();
      } catch (err) {}
    }

    return this.api.account.signUp(email, fullName, password, passwordConfirm, agreed, optIn, phone, inviteCode)
      .pipe(map((response: AccountResponse) => {
        if (response.isSuccessful) {
          const newAccount = response.getAccountVO();
          newAccount.isNew = true;
          this.setAccount(newAccount);
          return response;
        } else {
          throw response;
        }
      })).toPromise();
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
    if (this.archives.length > 1 ) {
      return this.dialog.open('ArchiveSwitcherDialogComponent',  {promptText}, { height: 'auto', width: 'fullscreen' });
    }
  }
}
