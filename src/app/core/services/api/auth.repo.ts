import { AccountVO, AccountPasswordVO } from '../../models';
import { HttpService, Observable } from './http.service';
import { BaseResponse } from './base';

export class AuthRepo {
  constructor(private http: HttpService) {
    console.log('auth.repo.ts', 7, 'new auth repo!');
  }

  public isLoggedIn() {
    return this.http.sendRequest('/auth/isLoggedIn', []);
  }

  public logIn(email: String, password: String, rememberMe: Boolean, keepLoggedIn: Boolean): Observable<BaseResponse> {
    const accountVO = new AccountVO({
      email: email,
      rememberMe: rememberMe,
      keepLoggedIn: keepLoggedIn
    });

    const accountPasswordVO = new AccountPasswordVO({
      password: password
    });

    return this.http.sendRequest('/auth/login', [{AccountVO: accountVO, AccountPasswordVO: accountPasswordVO}]);
  }

  public logOut() {

  }

  public signUp() {
  }

  public verify() {
  }


}
