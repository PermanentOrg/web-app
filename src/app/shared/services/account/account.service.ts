import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { find } from 'lodash';
import { CookieService } from 'ngx-cookie-service';

import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ArchiveVO, AccountVO, FolderVO } from '@root/app/models';
import { AuthResponse, AccountResponse, ArchiveResponse, FolderResponse } from '@shared/services/api/index.repo';

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

  public archiveChange: EventEmitter<ArchiveVO> = new EventEmitter();

  constructor(private api: ApiService, private storage: StorageService, private cookies: CookieService) {
    const cachedAccount = this.storage.local.get(ACCOUNT_KEY);
    const cachedArchive = this.storage.local.get(ARCHIVE_KEY);
    const cachedRoot = this.storage.local.get(ROOT_KEY);

    if (cachedAccount) {
      this.setAccount(new AccountVO(cachedAccount));
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

  public getAccount() {
    return this.account;
  }

  public getArchive() {
    return this.archive;
  }

  public getRootFolder() {
    return this.rootFolder;
  }

  public clearAccount() {
    this.account = undefined;
    this.storage.local.delete(ACCOUNT_KEY);
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

  public refreshAccount() {
  }

  public refreshArchive() {
    if (!this.archive) {
      return Promise.resolve();
    }

    return this.api.archive.get([this.archive])
      .then((response: ArchiveResponse) => {
        const newArchive = response.getArchiveVO();
        this.archive.update(newArchive);
        this.storage.local.set(ARCHIVE_KEY, this.archive);
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
      });
  }

  public checkSession(): Promise<boolean> {
    if (this.skipSessionCheck) {
      this.skipSessionCheck = false;
      return Promise.resolve(true);
    }

    return this.api.auth.isLoggedIn().toPromise()
      .then((response: AuthResponse) => {
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

    return this.api.auth.logIn(email, password, rememberMe, keepLoggedIn)
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          this.setArchive(response.getArchiveVO());
          this.skipSessionCheck = true;
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
        }

        return response;
      })).toPromise();
  }

  public verifyMfa(token: string): Promise<AuthResponse> {
    return this.api.auth.verify(this.account.primaryEmail, token, 'type.auth.mfaValidation')
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          this.setArchive(response.getArchiveVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }

  public verifyEmail(token: string): Promise<AuthResponse> {
    return this.api.auth.verify(this.account.primaryEmail, token, 'type.auth.email')
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }

  public switchToDefaultArchive(): Promise<ArchiveResponse> {
    return this.api.archive.getAllArchives(this.account)
      .then((response: ArchiveResponse) => {
        const archives = response.getArchiveVOs();
        const defaultArchiveData = find(archives, {archiveId: this.account.defaultArchiveId});
        this.setArchive(new ArchiveVO(defaultArchiveData));
        return response;
      });
  }

  public signUp(
    email: string, fullName: string, password: string, passwordConfirm: string,
    agreed: boolean, optIn: boolean, phone: string, inviteCode: string
  ) {
    this.skipSessionCheck = false;

    return this.api.account.signUp(email, fullName, password, passwordConfirm, agreed, optIn, phone, inviteCode)
      .pipe(map((response: AccountResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
  }
}
