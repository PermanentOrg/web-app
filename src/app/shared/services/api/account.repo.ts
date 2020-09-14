import { AccountVO, AccountPasswordVO, ArchiveVO, SimpleVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { Observable } from 'rxjs';

export class AccountRepo extends BaseRepo {
  public get(accountVO: AccountVO) {
    const account = {
      accountId: accountVO.accountId
    };

    return this.http.sendRequestPromise<AccountResponse>('/account/get', [account], AccountResponse);
  }

  public signUp(
    email: string, fullName: string, password: string, passwordConfirm: string,
    agreed: boolean, optIn: boolean, phone: string, inviteCode: string
  ) {
    const accountVO = new AccountVO({
      primaryEmail: email,
      primaryPhone: phone,
      fullName: fullName,
      agreed: agreed,
      optIn: optIn,
      inviteCode: inviteCode
    });

    const accountPasswordVO = new AccountPasswordVO({
      password: password,
      passwordVerify: passwordConfirm
    });

    const data = [{ AccountVO: accountVO, AccountPasswordVO: accountPasswordVO }];

    return this.http.sendRequest<AccountResponse>('/account/post', data, AccountResponse);

  }

  public update(accountVO: AccountVO) {
    const clone = new AccountVO(accountVO);
    delete clone.notificationPreferences;

    const data = [{
      AccountVO: clone
    }];

    return this.http.sendRequestPromise<AccountResponse>('/account/update', data, AccountResponse);
  }

  public delete(accountVO: AccountVO) {
    const clone = new AccountVO(accountVO);
    delete clone.notificationPreferences;

    const data = [{
      AccountVO: clone
    }];

    return this.http.sendRequestPromise<AccountResponse>('/account/delete', data, AccountResponse);
  }

  public updateNotificationPreference(preferencePath: string, value: boolean) {
    const data = [{
      SimpleVO: new SimpleVO({key: preferencePath, value})
    }];

    return this.http.sendRequestPromise<AccountResponse>('/account/updatePreference', data, AccountResponse);
  }
}

export class AccountResponse extends BaseResponse {
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
    return !!this.getAccountVO() && this.getAccountVO().needsVerification();
  }
}
