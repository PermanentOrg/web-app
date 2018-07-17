import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { ArchiveVO, AccountVO } from '../../../models';
import { AuthResponse, AccountResponse } from '../api/index.repo';

const ACCOUNT_KEY = 'account';
const ARCHIVE_KEY = 'archive';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private account: AccountVO;
  private archive: ArchiveVO;
  private skipSessionCheck: boolean;

  constructor(private api: ApiService, private storage: StorageService, private cookies: CookieService) {
    const cachedAccount = this.storage.local.get(ACCOUNT_KEY);
    const cachedArchive = this.storage.local.get(ARCHIVE_KEY);

    if (cachedAccount) {
      this.setAccount(new AccountVO(cachedAccount));
    }

    if (cachedArchive) {
      this.setArchive(new ArchiveVO(cachedArchive));
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

  public clearAccount() {
    this.account = undefined;
    this.storage.local.delete(ACCOUNT_KEY);
  }

  public clearArchive() {
    this.archive = undefined;
    this.storage.local.delete(ARCHIVE_KEY);
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
          this.setArchive(response.getArchiveVO());
          return response;
        } else {
          throw response;
        }
      })).toPromise();
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
