import { AccountVO, AccountPasswordVO, ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { Observable } from 'rxjs';

export class AccountRepo extends BaseRepo {
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

    return this.http.sendRequest('/account/post', [{AccountVO: accountVO, AccountPasswordVO: accountPasswordVO}], AccountResponse);

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
