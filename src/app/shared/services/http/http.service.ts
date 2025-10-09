import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@root/environments/environment';

import { RequestVO } from '@models/request-vo';
import { BaseResponse } from '@shared/services/api/base';
import { StorageService } from '@shared/services/storage/storage.service';

const CSRF_KEY = 'CSRF';

interface RequestOptions {
	ResponseClass?: any;
	useAuthorizationHeader?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	public tokenExpired = new Subject<void>();
	private apiUrl = environment.apiUrl;
	private DefaultResponseClass = BaseResponse;

	constructor(
		private http: HttpClient,
		private storage: StorageService,
	) {}

	public sendRequest<T = BaseResponse>(
		endpoint: string,
		data: any = [{}],
		options?: RequestOptions,
	): Observable<T> {
		const requestVO = new RequestVO(this.storage.session.get(CSRF_KEY), data);
		const url = this.apiUrl + endpoint;

		return this.http
			.post(
				url,
				{ RequestVO: requestVO },
				{ headers: this.generateHeaders(options) },
			)
			.pipe(
				map((response: any) => {
					if (response) {
						this.storage.session.set(CSRF_KEY, JSON.stringify(response.csrf));
					}
					if (options?.ResponseClass) {
						return new options.ResponseClass(response);
					} else {
						return new this.DefaultResponseClass(response);
					}
				}),
				catchError((err) => {
					if (err.status === 401) {
						this.tokenExpired.next();
					}
					return throwError(err);
				}),
			);
	}

	public async sendRequestPromise<T = BaseResponse>(
		endpoint: string,
		data: any = [{}],
		options?: RequestOptions,
	): Promise<T> {
		return await this.sendRequest(endpoint, data, options)
			.pipe(
				map((response: any | BaseResponse) => {
					if (!response.isSuccessful) {
						throw response;
					}

					return response;
				}),
			)
			.toPromise();
	}

	public generateHeaders(options?: {
		useAuthorizationHeader?: boolean;
	}): HttpHeaders {
		const authToken: string | undefined = this.storage.local.get('AUTH_TOKEN');
		if (options?.useAuthorizationHeader && authToken) {
			return new HttpHeaders({ Authorization: `Bearer ${authToken}` });
		}
		return new HttpHeaders();
	}
}

export { Observable };
