import { Injectable } from '@angular/core';

import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { ArchiveVO, AccountVO } from '../../models';
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

  constructor(private api: ApiService, private storage: StorageService) { }

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

  public isLoggedIn() {
    return this.api.auth.isLoggedIn()
      .subscribe((response: AuthResponse) => {
        console.log('account.service.ts', 42, response);
      });
  }

  public logIn(email: String, password: String, rememberMe: Boolean, keepLoggedIn: Boolean) {
    return this.api.auth.logIn(email, password, rememberMe, keepLoggedIn)
      .subscribe(response => {
        console.log('account.service.ts', 43, response);
      });
  }
  public logOut() {
    return this.api.auth.logOut()
      .subscribe(response => {

      });
  }
}
