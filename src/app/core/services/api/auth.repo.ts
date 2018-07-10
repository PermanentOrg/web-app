import { AccountVO, AccountPasswordVO } from '../../models';
import { HttpService, Observable } from '../http/http.service';
import { BaseResponse, BaseRepo } from './base';

export class AuthRepo extends BaseRepo {
  public isLoggedIn() {
    return this.http.sendRequest('/auth/loggedIn');
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
