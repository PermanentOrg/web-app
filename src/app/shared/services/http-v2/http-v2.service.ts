import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { environment } from '@root/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';

const CSRF_KEY = 'CSRF';

type HttpMethod = 'post' | 'get' | 'put' | 'delete';
type ResponseClass<T> = new (data: any) => T;

@Injectable({
  providedIn: 'root',
})
export class HttpV2Service {
  protected static readonly HttpHeaders = new HttpHeaders({
    'Request-Version': '2',
    'Content-Type': 'application/json',
  });
  protected apiUrl = environment.apiUrl;
  protected authToken: string;

  constructor(protected http: HttpClient, protected storage: StorageService) {}

  public post<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>
  ): Observable<T> {
    return this.makeHttpClientRequest(endpoint, data, 'post', responseClass);
  }

  public get<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>
  ): Observable<T> {
    return this.makeHttpClientRequest(
      this.getEndpointWithData(endpoint, data),
      {},
      'get',
      responseClass
    );
  }

  public put<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>
  ): Observable<T> {
    return this.makeHttpClientRequest(endpoint, data, 'put', responseClass);
  }

  public delete<T>(
    endpoint: string,
    data: any = {},
    responseClass?: ResponseClass<T>
  ): Observable<T> {
    return this.makeHttpClientRequest(
      this.getEndpointWithData(endpoint, data),
      {},
      'delete',
      responseClass
    );
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
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

  protected getFullUrl(endpoint: string): string {
    return Location.joinWithSlash(this.apiUrl, endpoint);
  }

  protected getHeaders() {
    let headers: HttpHeaders = HttpV2Service.HttpHeaders;
    if (this.authToken) {
      headers = headers.append('Authorization', `Bearer ${this.authToken}`);
    }
    return {
      headers,
    };
  }

  protected getObservableWithBody(
    url: string,
    data: any = {},
    method: HttpMethod
  ): Observable<unknown> {
    if (method === 'put') {
      return this.http.put(url, data, this.getHeaders());
    }
    return this.http.post(url, data, this.getHeaders());
  }

  protected getObservableWithNoBody(
    url: string,
    method: HttpMethod
  ): Observable<unknown> {
    if (method === 'delete') {
      return this.http.delete(url, this.getHeaders());
    }
    return this.http.get(url, this.getHeaders());
  }

  protected getObservable(
    endpoint: string,
    data: any = {},
    method: HttpMethod = 'post'
  ): Observable<unknown> {
    if (method === 'post' || method === 'put') {
      return this.getObservableWithBody(
        this.getFullUrl(endpoint),
        this.appendCsrf(data),
        method
      );
    }
    return this.getObservableWithNoBody(this.getFullUrl(endpoint), method);
  }

  protected makeHttpClientRequest<T>(
    endpoint: string,
    data: any = {},
    method: HttpMethod = 'post',
    responseClass?: new (data: any) => T
  ): Observable<T> {
    const observable = this.getObservable(endpoint, data, method);
    return observable.pipe(
      map((response: Object) => {
        if (response.hasOwnProperty('csrf')) {
          this.storage.session.set(CSRF_KEY, response['csrf']);
        }
        if (responseClass) {
          return new responseClass(response);
        }
        return response as T;
      })
    );
  }
}
