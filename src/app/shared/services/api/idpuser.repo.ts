import { firstValueFrom } from 'rxjs';
import { BaseRepo } from './base';

interface Method {
	methodId: string;
	method: string;
	value: string;
}

export class IdPuser extends BaseRepo {
	public async getTwoFactorMethods(): Promise<Method[]> {
		return await firstValueFrom(this.httpV2.get('/v2/idpuser'));
	}

	public async sendEnableCode(method: string, value: string) {
		return await firstValueFrom(
			this.httpV2.post(
				'/v2/idpuser/send-enable-code',
				{ method, value },
				undefined,
				{
					responseType: 'text',
				},
			),
		);
	}

	public async enableTwoFactor(method: string, value: string, code: string) {
		return await firstValueFrom(
			this.httpV2.post(
				'/v2/idpuser/enable-two-factor',
				{
					method,
					value,
					code,
				},
				undefined,
				{
					responseType: 'text',
				},
			),
		);
	}

	public async sendDisableCode(methodId: string) {
		return await firstValueFrom(
			this.httpV2.post(
				'/v2/idpuser/send-disable-code',
				{ methodId },
				undefined,
				{ responseType: 'text' },
			),
		);
	}

	public async disableTwoFactor(methodId: string, code: string) {
		return await firstValueFrom(
			this.httpV2.post(
				'/v2/idpuser/disable-two-factor',
				{ code, methodId },
				undefined,
				{
					responseType: 'text',
				},
			),
		);
	}
}
