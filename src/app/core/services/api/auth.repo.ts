import { AccountVO, AccountPasswordVO, ArchiveVO } from '../../models';
import { BaseResponse, BaseRepo } from './base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class AuthRepo extends BaseRepo {
  public isLoggedIn() {
    return this.http.sendRequest('/auth/loggedIn', undefined, AuthResponse);
  }

  public logIn(email: String, password: String, rememberMe: Boolean, keepLoggedIn: Boolean): Observable<any> {
    const accountVO = new AccountVO({
      email: email,
      rememberMe: rememberMe,
      keepLoggedIn: keepLoggedIn
    });

    const accountPasswordVO = new AccountPasswordVO({
      password: password
    });

    return this.http.sendRequest('/auth/login', [{AccountVO: accountVO, AccountPasswordVO: accountPasswordVO}], AuthResponse);
  }

  public logOut() {
    return this.http.sendRequest('/auth/logout');

  }

  public signUp() {
  }

  public verify() {
  }


}

export class AuthResponse extends BaseResponse {
  public getAccountVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new AccountVO(data[0].AccountVO);
  }

  public getArchiveVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new ArchiveVO(data[0].ArchiveVO);
  }
}
