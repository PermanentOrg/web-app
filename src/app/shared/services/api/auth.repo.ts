import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO } from '@models/index';
import { BaseResponse, BaseRepo } from './base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class AuthRepo extends BaseRepo {
  public isLoggedIn(): Observable<AuthResponse> {
    return this.http.sendRequest('/auth/loggedIn', undefined, AuthResponse);
  }

  public logIn(email: string, password: string, rememberMe: boolean, keepLoggedIn: boolean): Observable<AuthResponse> {
    const accountVO = new AccountVO({
      primaryEmail: email,
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

  public verify(email: string, token: string, type: string) {
    const accountVO = new AccountVO({
      primaryEmail: email
    });

    const authVO = new AuthVO({
      token: token,
      type: type
    });

    return this.http.sendRequest('/auth/verify', [{AccountVO: accountVO, AuthVO: authVO}], AuthResponse);
  }

  public forgotPassword(email: string) {
    const accountVO = new AccountVO({
      primaryEmail: email
    });

    return this.http.sendRequest('/auth/sendEmailForgotPassword', [{AccountVO: accountVO}], AuthResponse);
  }

}

export class AuthResponse extends BaseResponse {
  public getAccountVO() {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0]) {
      return null;
    }

    return new AccountVO(data[0][0].AccountVO);
  }

  public getArchiveVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new ArchiveVO(data[0][0].ArchiveVO);
  }

  public needsVerification() {
    return !this.isSuccessful && this.messageIncludesPhrase('status.auth.need');
  }

  public needsMFA() {
    return !this.isSuccessful && this.messageIncludes('warning.auth.mfaToken');
  }
}
