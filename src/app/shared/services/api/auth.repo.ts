import {
	AccountVO,
	AccountPasswordVO,
	ArchiveVO,
	AuthVO,
	AccountPasswordVOData,
	SimpleVO,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { Observable } from 'rxjs';
import { getFirst } from '../http-v2/http-v2.service';

export class AuthRepo extends BaseRepo {
	public async isLoggedIn(): Promise<AuthResponse> {
		return await this.http.sendRequestPromise('/auth/loggedIn', undefined, {
			responseClass: AuthResponse,
		});
	}

	public logIn(
		email: string,
		password: string,
		rememberMe: boolean,
		keepLoggedIn: boolean,
	): Observable<AuthResponse> {
		const accountVO = new AccountVO({
			primaryEmail: email,
			rememberMe,
			keepLoggedIn,
		});

		const accountPasswordVO = new AccountPasswordVO({
			password,
		});

		return this.http.sendRequest<AuthResponse>(
			'/auth/login',
			[{ AccountVO: accountVO, AccountPasswordVO: accountPasswordVO }],
			{ responseClass: AuthResponse },
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
			token,
			type,
		});

		return this.http.sendRequest<AuthResponse>(
			'/auth/verify',
			[{ AccountVO: accountVO, AuthVO: authVO }],
			{ responseClass: AuthResponse },
		);
	}

	public forgotPassword(email: string) {
		const accountVO = new AccountVO({
			primaryEmail: email,
		});

		return this.http.sendRequest<AuthResponse>(
			'/auth/sendEmailForgotPassword',
			[{ AccountVO: accountVO }],
			{ responseClass: AuthResponse },
		);
	}

	public async updatePassword(
		account: AccountVO,
		passwordVo: AccountPasswordVOData,
		trustToken?: string,
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
			return await this.httpV2
				.post('/account/changePassword', v2data, null, { csrf: true })
				.toPromise();
		}

		return await this.http.sendRequestPromise<AuthResponse>(
			'/account/changePassword',
			data,
			{ responseClass: AuthResponse },
		);
	}

	public async resendEmailVerification(accountVO: AccountVO) {
		const account = {
			primaryEmail: accountVO.primaryEmail,
			accountId: accountVO.accountId,
		};

		return await this.http.sendRequestPromise<AuthResponse>(
			'/auth/resendMailCreatedAccount',
			[account],
			{ responseClass: AuthResponse },
		);
	}

	public async resendPhoneVerification(accountVO: AccountVO) {
		const account = {
			primaryEmail: accountVO.primaryEmail,
			accountId: accountVO.accountId,
		};

		return await this.http.sendRequestPromise<AuthResponse>(
			'/auth/resendTextCreatedAccount',
			[account],
			{ responseClass: AuthResponse },
		);
	}

	public async getInviteToken() {
		return await getFirst(
			this.httpV2.get<{ token: string }>('v2/account/signup'),
		).toPromise();
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

	public getAuthToken() {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		for (const voType in data[0][0]) {
			if (data[0][0][voType]?.key === 'authToken') {
				return new SimpleVO(data[0][0][voType]);
			}
		}

		return null;
	}
}
