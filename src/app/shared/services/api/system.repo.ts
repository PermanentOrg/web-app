import { BaseResponse, BaseRepo } from '@shared/services/api/base';

interface SystemExceptionVO {
	errorType;
	errorCode;
	thrownBy;
	caughtBy;
	detail;
}

export class SystemResponse extends BaseResponse {}

export class SystemRepo extends BaseRepo {
	public async logError(error: Error) {
		const vo: SystemExceptionVO = {
			errorType: 'M-dot UI Error',
			errorCode: 0,
			thrownBy: error.stack?.substr(0, 128),
			caughtBy: '',
			detail: error.stack?.substr(0, 2000),
		};

		const data = [
			{
				SystemExceptionVO: vo,
			},
		];

		return await this.http.sendRequestPromise<SystemResponse>(
			'/system/logError',
			data,
			{ ResponseClass: SystemResponse },
		);
	}
}
