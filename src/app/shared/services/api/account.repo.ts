import { AccountVO, ArchiveVO, SimpleVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { firstValueFrom } from 'rxjs';
import { getFirst } from '../http-v2/http-v2.service';

type AccountUpdateRequest = Pick<AccountVO, 'primaryEmail'> & {
	postalCode?: string;
} & Partial<AccountVO>;
export class AccountRepo extends BaseRepo {
	public async get(accountVO: AccountVO) {
		const account = {
			accountId: accountVO.accountId,
		};

		return await this.http.sendRequestPromise<AccountResponse>(
			'/account/get',
			[account],
			{ responseClass: AccountResponse },
		);
	}

	public signUp(
		email: string,
		fullName: string,
		password: string,
		passwordConfirm: string,
		agreed: boolean,
		optIn: boolean,
		createDefaultArchive: boolean,
		phone?: string,
		inviteCode?: string,
	) {
		const requestBody = {
			primaryEmail: email,
			primaryPhone: phone,
			fullName,
			agreed,
			optIn,
			password,
			passwordVerify: passwordConfirm,
			inviteCode,
			createArchive: createDefaultArchive,
		};

		this.httpV2.clearAuthToken();

		return getFirst(
			this.httpV2.post<AccountVO>('/account/post', requestBody, AccountVO, {
				csrf: true,
			}),
		);
	}

	public async update(accountUpdateRequest: AccountUpdateRequest) {
		const requestBody = { ...accountUpdateRequest };
		requestBody.postalCode = requestBody.zip;
		delete requestBody.zip;

		return (
			await firstValueFrom(
				this.httpV2.post<AccountVO>('/account/update', requestBody, AccountVO),
			)
		)[0];
	}

	public async delete(accountVO: AccountVO) {
		const clone = new AccountVO(accountVO);
		delete clone.notificationPreferences;

		const data = [
			{
				AccountVO: clone,
			},
		];

		return await this.http.sendRequestPromise<AccountResponse>(
			'/account/delete',
			data,
			{ responseClass: AccountResponse },
		);
	}

	public async updateNotificationPreference(
		preferencePath: string,
		value: boolean,
	) {
		const data = [
			{
				SimpleVO: new SimpleVO({ key: preferencePath, value }),
			},
		];

		return await this.http.sendRequestPromise<AccountResponse>(
			'/account/updatePreference',
			data,
			{ responseClass: AccountResponse },
		);
	}

	public async updateAccountTags(addTags: string[], removeTags: string[]) {
		return await this.httpV2
			.put<{}>(`/v2/account/tags`, { addTags, removeTags }, null)
			.toPromise();
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
