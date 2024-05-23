/* @format */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@root/environments/environment';

import { RequestVO } from '@models/request-vo';
import { BaseResponse } from '@shared/services/api/base';
import { StorageService } from '@shared/services/storage/storage.service';

const CSRF_KEY = 'CSRF';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private apiUrl = environment.apiUrl;
  private defaultResponseClass = BaseResponse;

  constructor(private http: HttpClient, private storage: StorageService) {}

  public sendRequest<T = BaseResponse>(
    endpoint: string,
    data: any = [{}],
    responseClass?: any
  ): Observable<T> {
    const requestVO = new RequestVO(this.storage.session.get(CSRF_KEY), data);
    const url = this.apiUrl + endpoint;

    return this.http
      .post(url, { RequestVO: requestVO }, { headers: this.generateHeaders() })
      .pipe(
        map((response: any) => {
          if (response) {
            this.storage.session.set(CSRF_KEY, JSON.stringify(response.csrf));
          }
          if (responseClass) {
            return new responseClass(response);
          } else {
            return new this.defaultResponseClass(response);
          }
        })
      );
  }

  public sendRequestPromise<T = BaseResponse>(
    endpoint: string,
    data: any = [{}],
    responseClass?: any
  ): Promise<T> {
    return this.sendRequest(endpoint, data, responseClass)
      .pipe(
        map((response: any | BaseResponse) => {
          if (!response.isSuccessful) {
            throw response;
          }

          return response;
        })
      )
      .toPromise();
  }

  public generateHeaders(): HttpHeaders {
    const authToken: string | undefined = this.storage.local.get('AUTH_TOKEN');
    if (authToken) {
      return new HttpHeaders({ Authorization: `Bearer ${authToken}` });
    }
    return new HttpHeaders();
  }
}

export { Observable };
