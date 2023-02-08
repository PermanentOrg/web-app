/* @format */
import {
  AccountVO,
  AccountPasswordVO,
  ArchiveVO,
  AuthVO,
  AccountPasswordVOData,
  SimpleVO,
} from '@root/app/models';
import {
  BaseResponse,
  BaseRepo,
  CSRFResponse,
} from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class AuthRepo extends BaseRepo {
  public isLoggedIn(): Promise<AuthResponse> {
    return this.http.sendRequestPromise(
      '/auth/loggedIn',
      undefined,
      AuthResponse
    );
  }

  public logIn(
    email: string,
    password: string,
    rememberMe: boolean,
    keepLoggedIn: boolean
  ): Observable<AuthResponse> {
    const accountVO = new AccountVO({
      primaryEmail: email,
      rememberMe: rememberMe,
      keepLoggedIn: keepLoggedIn,
    });

    const accountPasswordVO = new AccountPasswordVO({
      password: password,
    });

    return this.http.sendRequest<AuthResponse>(
      '/auth/login',
      [{ AccountVO: accountVO, AccountPasswordVO: accountPasswordVO }],
      AuthResponse
    );
  }

  public logOut() {
    return this.http.sendRequest<AuthResponse>('/auth/logout');
  }

  public verify(account: AccountVO, token: string, type: string) {
    const accountVO = new AccountVO({
      primaryEmail: account.primaryEmail,
      accountId: account.accountId,
    });

    const authVO = new AuthVO({
      token: token,
      type: type,
    });

    return this.http.sendRequest<AuthResponse>(
      '/auth/verify',
      [{ AccountVO: accountVO, AuthVO: authVO }],
      AuthResponse
    );
  }

  public forgotPassword(email: string) {
    const accountVO = new AccountVO({
      primaryEmail: email,
    });

    return this.http.sendRequest<AuthResponse>(
      '/auth/sendEmailForgotPassword',
      [{ AccountVO: accountVO }],
      AuthResponse
    );
  }

  public updatePassword(
    account: AccountVO,
    passwordVo: AccountPasswordVOData,
    trustToken?: string
  ) {
    const data = [
      {
        AccountVO: account,
        AccountPasswordVO: passwordVo,
      },
    ];

    if (trustToken) {
      const v2data = {
        accountId: parseInt(account.accountId, 10),
        passwordOld: passwordVo.passwordOld,
        password: passwordVo.password,
        passwordVerify: passwordVo.passwordVerify,
        trustToken,
      };
      return this.http.sendV2RequestPromise<CSRFResponse>(
        '/account/changePassword',
        v2data
      );
    }

    return this.http.sendRequestPromise<AuthResponse>(
      '/account/changePassword',
      data,
      AuthResponse
    );
  }

  public resendEmailVerification(accountVO: AccountVO) {
    const account = {
      primaryEmail: accountVO.primaryEmail,
      accountId: accountVO.accountId,
    };

    return this.http.sendRequestPromise<AuthResponse>(
      '/auth/resendMailCreatedAccount',
      [account],
      AuthResponse
    );
  }

  public resendPhoneVerification(accountVO: AccountVO) {
    const account = {
      primaryEmail: accountVO.primaryEmail,
      accountId: accountVO.accountId,
    };

    return this.http.sendRequestPromise<AuthResponse>(
      '/auth/resendTextCreatedAccount',
      [account],
      AuthResponse
    );
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

  public getTrustToken() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new SimpleVO(data[0][0].SimpleVO);
  }
}
