import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@root/environments/environment';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { StorageService } from '../storage/storage.service';
import { SecretsService } from '../secrets/secrets.service';
import { HttpV2Encoder } from './http-v2-encoder';

const CSRF_KEY = 'CSRF';
const AUTH_KEY = 'AUTH_TOKEN';

type HttpMethod = 'post' | 'get' | 'put' | 'delete' | 'patch';
type ResponseClass<T> = new (data: any) => T;
type ResponseType = 'json' | 'text';

interface RequestOptions {
	csrf?: boolean;
	authToken?: boolean;
	shareToken?: string | null;
	useStelaDomain?: boolean;
	responseType?: ResponseType;
}

const defaultOptions: RequestOptions = {
	csrf: false,
	authToken: true,
	shareToken: null,
	useStelaDomain: true,
	responseType: 'json',
};

export function getFirst<T>(observable: Observable<T[]>): Observable<T> {
	return observable.pipe(map((obj) => obj[0]));
}

@Injectable({
	providedIn: 'root',
})
export class HttpV2Service {
	protected static readonly HttpHeaders = new HttpHeaders({
		'Request-Version': '2',
		'Content-Type': 'application/json',
	});

	public tokenExpired: Subject<void> = new Subject<void>();

	protected apiUrl = environment.apiUrl;
	protected authToken: string | null;

	constructor(
		protected http: HttpClient,
		protected storage: StorageService,
		protected secrets: SecretsService,
	) {
		this.authToken = this.storage.local.get(AUTH_KEY) ?? '';
	}

	public isAuthTokenSet(): boolean {
		return this.authToken && this.authToken.length > 0;
	}

	public post<T>(
		endpoint: string,
		data: any = {},
		ResponseClass?: ResponseClass<T>,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		return this.makeHttpClientRequest(
			endpoint,
			data,
			'post',
			ResponseClass,
			this.getOptions(options),
		);
	}

	public get<T>(
		endpoint: string,
		data: any = {},
		ResponseClass?: ResponseClass<T>,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		return this.makeHttpClientRequest(
			this.getEndpointWithData(endpoint, data),
			{},
			'get',
			ResponseClass,
			this.getOptions(options),
		);
	}

	public put<T>(
		endpoint: string,
		data: any = {},
		ResponseClass?: ResponseClass<T>,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		return this.makeHttpClientRequest(
			endpoint,
			data,
			'put',
			ResponseClass,
			this.getOptions(options),
		);
	}

	public patch<T>(
		endpoint: string,
		data: any = {},
		ResponseClass?: ResponseClass<T>,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		return this.makeHttpClientRequest(
			endpoint,
			data,
			'patch',
			ResponseClass,
			this.getOptions(options),
		);
	}

	public delete<T>(
		endpoint: string,
		data: any = {},
		ResponseClass?: ResponseClass<T>,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		return this.makeHttpClientRequest(
			this.getEndpointWithData(endpoint, data),
			{},
			'delete',
			ResponseClass,
			this.getOptions(options),
		);
	}

	public setAuthToken(token: string): void {
		this.authToken = token;
		this.storage.local.set(AUTH_KEY, token);
	}

	public clearAuthToken(): void {
		this.setAuthToken(null);
		this.storage.local.delete(AUTH_KEY);
	}

	protected getOptions(opts: Partial<RequestOptions>): RequestOptions {
		return Object.assign({}, defaultOptions, opts);
	}

	protected updateArrayParamNames(data: unknown = {}): any {
		const workingData = Object.assign({}, data);
		const keys = Object.keys(data);
		for (const key of keys) {
			if (Array.isArray(data[key])) {
				workingData[`${key}[]`] = workingData[key];
				delete workingData[key];
			}
		}
		return workingData;
	}

	protected getEndpointWithData(endpoint: string, data: any = {}): string {
		const params = new HttpParams({ encoder: new HttpV2Encoder() }).appendAll(
			this.updateArrayParamNames(data),
		);
		if (params.toString().length === 0) {
			return endpoint;
		}
		return `${endpoint}?${params.toString()}`;
	}

	protected appendCsrf(data: any): Object {
		return {
			...data,
			csrf: this.storage.session.get(CSRF_KEY),
		};
	}

	protected getFullUrl(endpoint: string, options: RequestOptions): string {
		return Location.joinWithSlash(
			this.getRequestDomain(endpoint, options),
			endpoint,
		);
	}

	protected getRequestDomain(
		endpoint: string,
		options: RequestOptions,
	): string {
		if (
			options.useStelaDomain &&
			endpoint.match(/^\/*v2\//) &&
			this.isStelaDomainDefined()
		) {
			return this.secrets.get('STELA_DOMAIN') ?? this.apiUrl;
		}
		return this.apiUrl;
	}

	protected isStelaDomainDefined() {
		const stelaDomain = this.secrets.get('STELA_DOMAIN') ?? '';
		return stelaDomain.length > 0;
	}

	protected getHeaders(options: RequestOptions) {
		let headers: HttpHeaders = HttpV2Service.HttpHeaders;
		if (this.authToken && options.authToken) {
			headers = headers.append('Authorization', `Bearer ${this.authToken}`);
		}
		if (options.shareToken) {
			headers = headers.append('X-Permanent-Share-Token', options.shareToken);
		}
		return {
			headers,
		};
	}

	protected getObservableWithBody(
		url: string,
		data: any = {},
		method: HttpMethod,
		options: RequestOptions,
	): Observable<unknown> {
		const requestOptions: Object = {
			...this.getHeaders(options),
			responseType: options.responseType,
		};
		if (method === 'put') {
			return this.http.put(url, data, requestOptions);
		}

		if (method === 'patch') {
			return this.http.patch(url, data, requestOptions);
		}
		return this.http.post(url, data, requestOptions);
	}

	protected getObservableWithNoBody(
		url: string,
		method: HttpMethod,
		options: RequestOptions,
	): Observable<unknown> {
		const requestOptions: Object = {
			...this.getHeaders(options),
			responseType: options.responseType,
		};
		if (method === 'delete') {
			return this.http.delete(url, requestOptions);
		}
		return this.http.get(url, requestOptions);
	}

	protected getObservable(
		endpoint: string,
		data: any = {},
		method: HttpMethod = 'post',
		options: RequestOptions = defaultOptions,
	): Observable<unknown> {
		if (method === 'post' || method === 'put' || method === 'patch') {
			return this.getObservableWithBody(
				this.getFullUrl(endpoint, options),
				options.csrf ? this.appendCsrf(data) : data,
				method,
				options,
			);
		}
		return this.getObservableWithNoBody(
			this.getFullUrl(endpoint, options),
			method,
			options,
		);
	}

	protected makeHttpClientRequest<T>(
		endpoint: string,
		data: any = {},
		method: HttpMethod = 'post',
		ResponseClass?: new (data: any) => T,
		options: RequestOptions = defaultOptions,
	): Observable<T[]> {
		const observable = this.getObservable(endpoint, data, method, options);

		return observable.pipe(
			map((response: Object | Array<Object>) => {
				if (options.responseType === 'text') {
					return [response as unknown as T];
				}

				if (Array.isArray(response)) {
					return response.map((obj) => {
						if (ResponseClass) {
							return new ResponseClass(obj);
						}
						return obj as T;
					});
				}
				if ('csrf' in response) {
					this.storage.session.set(CSRF_KEY, response.csrf);
				}
				if (ResponseClass) {
					return [new ResponseClass(response)];
				}
				return [response as T];
			}),
			catchError((err) => {
				if (err.status === 401) {
					this.tokenExpired.next();
				}
				return throwError(err);
			}),
		);
	}
}
