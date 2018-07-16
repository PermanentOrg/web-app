import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { ArchiveVO, AccountVO } from '../../../models';
import { AuthResponse } from '../api/auth.repo';

const ACCOUNT_KEY = 'account';
const ARCHIVE_KEY = 'archive';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private account: AccountVO;
  private archive: ArchiveVO;
  public authStatus: string[];

  constructor(private api: ApiService, private storage: StorageService) {
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

  public checkSession(): Promise<Boolean> {
    return this.api.auth.isLoggedIn().toPromise()
      .then((response: AuthResponse) => {
        return response.getSimpleVO().value;
      });
  }

  public isLoggedIn(): Boolean {
    return !!this.account && !!this.archive;
  }

  public logIn(email: string, password: string, rememberMe: Boolean, keepLoggedIn: Boolean): Promise<any> {
    return this.api.auth.logIn(email, password, rememberMe, keepLoggedIn)
      .pipe(map((response: AuthResponse) => {
        if (response.isSuccessful) {
          this.setAccount(response.getAccountVO());
          this.setArchive(response.getArchiveVO());
        } else if (response.needsMFA()) {
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
      // .then((response: AuthResponse) => {
      //   this.api
      //   return response;
      // });
  }
}
