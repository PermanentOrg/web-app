/* @format */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { environment } from '@root/environments/environment';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { SecretsService } from '../secrets/secrets.service';

const CSRF_KEY = 'CSRF';
const AUTH_KEY = 'AUTH_TOKEN';

type HttpMethod = 'post' | 'get' | 'put' | 'delete';
type ResponseClass<T> = new (data: any) => T;

interface RequestOptions {
  csrf?: boolean;
  authToken?: boolean;
  useStelaDomain?: boolean;
}

const defaultOptions: RequestOptions = {
  csrf: false,
  authToken: true,
  useStelaDomain: true,
};

export function getFirst<T>(observable: Observable<T[]>): Observable<T> {
  return observable.pipe(
    map((obj) => {
      return obj[0];
    })
  );
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
    protected secrets: SecretsService
  ) {
    this.authToken = this.storage.local.get(AUTH_KEY) ?? '';
  }

  public post<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>,
    options: RequestOptions = defaultOptions
  ): Observable<T[]> {
    return this.makeHttpClientRequest(
      endpoint,
      data,
      'post',
      responseClass,
      this.getOptions(options)
    );
  }

  public get<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>,
    options: RequestOptions = defaultOptions
  ): Observable<T[]> {
    return this.makeHttpClientRequest(
      this.getEndpointWithData(endpoint, data),
      {},
      'get',
      responseClass,
      this.getOptions(options)
    );
  }

  public put<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>,
    options: RequestOptions = defaultOptions
  ): Observable<T[]> {
    return this.makeHttpClientRequest(
      endpoint,
      data,
      'put',
      responseClass,
      this.getOptions(options)
    );
  }

  public delete<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>,
    options: RequestOptions = defaultOptions
  ): Observable<T[]> {
    return this.makeHttpClientRequest(
      this.getEndpointWithData(endpoint, data),
      {},
      'delete',
      responseClass,
      this.getOptions(options)
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

  protected getEndpointWithData(endpoint: string, data: any = {}): string {
    const params = new HttpParams().appendAll(data);
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
      endpoint
    );
  }

  protected getRequestDomain(
    endpoint: string,
    options: RequestOptions
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
    return {
      headers,
    };
  }

  protected getObservableWithBody(
    url: string,
    data: any = {},
    method: HttpMethod,
    options: RequestOptions
  ): Observable<unknown> {
    if (method === 'put') {
      return this.http.put(url, data, this.getHeaders(options));
    }
    return this.http.post(url, data, this.getHeaders(options));
  }

  protected getObservableWithNoBody(
    url: string,
    method: HttpMethod,
    options: RequestOptions
  ): Observable<unknown> {
    if (method === 'delete') {
      return this.http.delete(url, this.getHeaders(options));
    }
    return this.http.get(url, this.getHeaders(options));
  }

  protected getObservable(
    endpoint: string,
    data: any = {},
    method: HttpMethod = 'post',
    options: RequestOptions = defaultOptions
  ): Observable<unknown> {
    if (method === 'post' || method === 'put') {
      return this.getObservableWithBody(
        this.getFullUrl(endpoint, options),
        options.csrf ? this.appendCsrf(data) : data,
        method,
        options
      );
    }
    return this.getObservableWithNoBody(
      this.getFullUrl(endpoint, options),
      method,
      options
    );
  }

  protected makeHttpClientRequest<T>(
    endpoint: string,
    data: any = {},
    method: HttpMethod = 'post',
    responseClass?: new (data: any) => T,
    options: RequestOptions = defaultOptions
  ): Observable<T[]> {
    const observable = this.getObservable(endpoint, data, method, options);
    return observable.pipe(
      map((response: Object | Array<Object>) => {
        if (Array.isArray(response)) {
          return response.map((obj) => {
            if (responseClass) {
              return new responseClass(obj);
            }
            return obj as T;
          });
        }
        if (response.hasOwnProperty('csrf')) {
          this.storage.session.set(CSRF_KEY, response['csrf']);
        }
        if (responseClass) {
          return [new responseClass(response)];
        }
        return [response as T];
      }),
      catchError((err) => {
        if (err.status === 401) {
          this.tokenExpired.next();
        }
        return throwError(err);
      })
    );
  }
}
